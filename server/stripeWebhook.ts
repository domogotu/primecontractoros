import express, { Request, Response, Router } from "express";
import Stripe from "stripe";
import { getDb } from "./db";
import { subscriptions, workspaces, billingEvents, checkoutSessions } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { updateAccessState, logBillingAudit } from "./accessGating";

const router = Router();

// Webhook must use raw body for signature verification
router.post(
  "/api/stripe/webhook",
  express.raw({ type: "application/json" }),
  async (req: Request, res: Response) => {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
      apiVersion: "2025-04-30.basil" as any,
    });

    const sig = req.headers["stripe-signature"] as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event: Stripe.Event;

    try {
      if (webhookSecret) {
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
      } else {
        // In development without webhook secret, parse directly
        event = JSON.parse(req.body.toString()) as Stripe.Event;
      }
    } catch (err: any) {
      console.error("[Stripe Webhook] Signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle test events
    if (event.id.startsWith("evt_test_")) {
      console.log("[Stripe Webhook] Test event detected, returning verification response");
      return res.json({ verified: true });
    }

    console.log(`[Stripe Webhook] Received event: ${event.type} (${event.id})`);

    try {
      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object as Stripe.Checkout.Session;
          await handleCheckoutComplete(session);
          break;
        }
        case "customer.subscription.updated": {
          const subscription = event.data.object as Stripe.Subscription;
          await handleSubscriptionUpdated(subscription);
          break;
        }
        case "customer.subscription.deleted": {
          const subscription = event.data.object as Stripe.Subscription;
          await handleSubscriptionDeleted(subscription);
          break;
        }
        case "customer.subscription.trial_will_end": {
          const subscription = event.data.object as Stripe.Subscription;
          console.log(`[Stripe Webhook] Trial ending soon for subscription ${subscription.id}`);
          // Log a billing event for the workspace
          await handleTrialWillEnd(subscription);
          break;
        }
        case "invoice.paid": {
          const invoice = event.data.object as Stripe.Invoice;
          await handleInvoicePaid(invoice);
          break;
        }
        case "invoice.payment_failed": {
          const invoice = event.data.object as Stripe.Invoice;
          await handlePaymentFailed(invoice);
          break;
        }
        case "invoice.payment_action_required": {
          const invoice = event.data.object as Stripe.Invoice;
          await handlePaymentActionRequired(invoice);
          break;
        }
        default:
          console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
      }
    } catch (error: any) {
      console.error(`[Stripe Webhook] Error processing ${event.type}:`, error.message);
    }

    res.json({ received: true });
  }
);

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const db = await getDb();
  if (!db) return;

  const workspaceId = parseInt(session.metadata?.workspaceId || "0");
  const planId = parseInt(session.metadata?.planId || "0");

  if (!workspaceId || !planId) {
    console.error("[Stripe Webhook] Missing workspaceId or planId in metadata");
    return;
  }

  const stripeCustomerId = session.customer as string;
  const stripeSubscriptionId = session.subscription as string;

  // Upsert subscription record
  const [existing] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.workspaceId, workspaceId));

  if (existing) {
    await db
      .update(subscriptions)
      .set({
        planId,
        stripeCustomerId,
        stripeSubscriptionId,
        status: "active",
        currentPeriodStart: new Date(),
      })
      .where(eq(subscriptions.id, existing.id));
  } else {
    await db.insert(subscriptions).values({
      workspaceId,
      planId,
      stripeCustomerId,
      stripeSubscriptionId,
      status: "active",
      currentPeriodStart: new Date(),
    });
  }

  // Update checkout session record if it exists
  if (session.id) {
    await db
      .update(checkoutSessions)
      .set({ status: "completed", completedAt: new Date() })
      .where(eq(checkoutSessions.stripeSessionId, session.id));
  }

  // Update access state to active_paid
  await updateAccessState(workspaceId, "active_paid", "Checkout completed via Stripe webhook");

  // Log billing event
  await db.insert(billingEvents).values({
    workspaceId,
    eventType: "checkout_completed",
    newState: "active_paid",
    reason: `Stripe checkout.session.completed — plan ${planId}`,
    metadata: JSON.stringify({
      stripeSessionId: session.id,
      stripeCustomerId,
      stripeSubscriptionId,
      planId,
    }),
  });

  await logBillingAudit(workspaceId, "checkout_completed", 0, `Stripe checkout completed for plan ${planId}`, {
    stripeSessionId: session.id,
    planId,
  });

  console.log(`[Stripe Webhook] Subscription activated for workspace ${workspaceId}, plan ${planId}`);
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const db = await getDb();
  if (!db) return;

  const [sub] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.stripeSubscriptionId, subscription.id));

  if (!sub) return;

  const statusMap: Record<string, string> = {
    active: "active",
    past_due: "past_due",
    canceled: "canceled",
    trialing: "trialing",
    incomplete: "incomplete",
    incomplete_expired: "canceled",
    unpaid: "past_due",
    paused: "past_due",
  };

  const newStatus = statusMap[subscription.status] || "active";

  await db
    .update(subscriptions)
    .set({
      status: newStatus as any,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
      currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
    })
    .where(eq(subscriptions.id, sub.id));

  // Map Stripe subscription status to access state
  const accessStateMap: Record<string, string> = {
    active: "active_paid",
    trialing: "trial_active",
    past_due: "past_due",
    canceled: "canceled",
    incomplete: "pending_payment",
    incomplete_expired: "canceled",
    unpaid: "past_due",
    paused: "past_due",
  };

  const newAccessState = accessStateMap[subscription.status];
  if (newAccessState) {
    await updateAccessState(
      sub.workspaceId,
      newAccessState as any,
      `Stripe subscription.updated — status: ${subscription.status}`
    );

    // Log billing event
    await db.insert(billingEvents).values({
      workspaceId: sub.workspaceId,
      eventType: "subscription_updated",
      oldState: undefined,
      newState: newAccessState,
      reason: `Stripe subscription ${subscription.id} updated to ${subscription.status}`,
      metadata: JSON.stringify({ stripeSubscriptionId: subscription.id, stripeStatus: subscription.status }),
    });
  }

  console.log(`[Stripe Webhook] Subscription ${subscription.id} updated to ${subscription.status}`);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const db = await getDb();
  if (!db) return;

  const [sub] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.stripeSubscriptionId, subscription.id));

  if (!sub) return;

  await db
    .update(subscriptions)
    .set({ status: "canceled" })
    .where(eq(subscriptions.id, sub.id));

  // Update access state to canceled
  await updateAccessState(sub.workspaceId, "canceled", `Stripe subscription ${subscription.id} deleted`);

  // Log billing event
  await db.insert(billingEvents).values({
    workspaceId: sub.workspaceId,
    eventType: "subscription_canceled",
    newState: "canceled",
    reason: `Stripe subscription.deleted — ${subscription.id}`,
    metadata: JSON.stringify({ stripeSubscriptionId: subscription.id }),
  });

  await logBillingAudit(sub.workspaceId, "subscription_canceled", 0, `Stripe subscription ${subscription.id} deleted`);

  console.log(`[Stripe Webhook] Subscription ${subscription.id} canceled`);
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  const db = await getDb();
  if (!db) return;

  const subscriptionId = (invoice as any).subscription as string;
  if (!subscriptionId) return;

  const [sub] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.stripeSubscriptionId, subscriptionId));

  if (!sub) return;

  // Invoice paid — ensure access is active
  await db
    .update(subscriptions)
    .set({ status: "active" })
    .where(eq(subscriptions.id, sub.id));

  await updateAccessState(sub.workspaceId, "active_paid", `Invoice ${invoice.id} paid`);

  await db.insert(billingEvents).values({
    workspaceId: sub.workspaceId,
    eventType: "invoice_paid",
    newState: "active_paid",
    reason: `Invoice ${invoice.id} paid`,
    metadata: JSON.stringify({ stripeInvoiceId: invoice.id, amount: invoice.amount_paid }),
  });

  console.log(`[Stripe Webhook] Invoice paid: ${invoice.id}`);
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const db = await getDb();
  if (!db) return;

  const subscriptionId = (invoice as any).subscription as string;
  if (!subscriptionId) return;

  const [sub] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.stripeSubscriptionId, subscriptionId));

  if (!sub) return;

  await db
    .update(subscriptions)
    .set({ status: "past_due" })
    .where(eq(subscriptions.id, sub.id));

  // Update access state to past_due
  await updateAccessState(sub.workspaceId, "past_due", `Payment failed for invoice ${invoice.id}`);

  await db.insert(billingEvents).values({
    workspaceId: sub.workspaceId,
    eventType: "payment_failed",
    newState: "past_due",
    reason: `Invoice ${invoice.id} payment failed`,
    metadata: JSON.stringify({ stripeInvoiceId: invoice.id, subscriptionId }),
  });

  await logBillingAudit(sub.workspaceId, "payment_failed", 0, `Payment failed for invoice ${invoice.id}`);

  console.log(`[Stripe Webhook] Payment failed for subscription ${subscriptionId}`);
}

async function handlePaymentActionRequired(invoice: Stripe.Invoice) {
  const db = await getDb();
  if (!db) return;

  const subscriptionId = (invoice as any).subscription as string;
  if (!subscriptionId) return;

  const [sub] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.stripeSubscriptionId, subscriptionId));

  if (!sub) return;

  await updateAccessState(sub.workspaceId, "pending_payment", `Payment action required for invoice ${invoice.id}`);

  await db.insert(billingEvents).values({
    workspaceId: sub.workspaceId,
    eventType: "payment_action_required",
    newState: "pending_payment",
    reason: `Invoice ${invoice.id} requires payment action`,
    metadata: JSON.stringify({ stripeInvoiceId: invoice.id }),
  });

  console.log(`[Stripe Webhook] Payment action required for subscription ${subscriptionId}`);
}

async function handleTrialWillEnd(subscription: Stripe.Subscription) {
  const db = await getDb();
  if (!db) return;

  const [sub] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.stripeSubscriptionId, subscription.id));

  if (!sub) return;

  await db.insert(billingEvents).values({
    workspaceId: sub.workspaceId,
    eventType: "trial_will_end",
    newState: "trial_active",
    reason: `Trial ending soon for subscription ${subscription.id}`,
    metadata: JSON.stringify({
      stripeSubscriptionId: subscription.id,
      trialEnd: (subscription as any).trial_end,
    }),
  });

  console.log(`[Stripe Webhook] Trial will end for subscription ${subscription.id}`);
}

export const stripeWebhookRouter = router;
