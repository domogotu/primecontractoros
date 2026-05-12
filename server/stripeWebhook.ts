import express, { Request, Response, Router } from "express";
import Stripe from "stripe";
import { getDb } from "./db";
import { subscriptions, workspaces } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";

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
        case "invoice.paid": {
          const invoice = event.data.object as Stripe.Invoice;
          console.log(`[Stripe Webhook] Invoice paid: ${invoice.id}`);
          break;
        }
        case "invoice.payment_failed": {
          const invoice = event.data.object as Stripe.Invoice;
          await handlePaymentFailed(invoice);
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

  const statusMap: Record<string, any> = {
    active: "active",
    past_due: "past_due",
    canceled: "canceled",
    trialing: "trialing",
    incomplete: "incomplete",
  };

  await db
    .update(subscriptions)
    .set({
      status: statusMap[subscription.status] || "active",
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
      currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
    })
    .where(eq(subscriptions.id, sub.id));

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

  console.log(`[Stripe Webhook] Subscription ${subscription.id} canceled`);
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

  console.log(`[Stripe Webhook] Payment failed for subscription ${subscriptionId}`);
}

export const stripeWebhookRouter = router;
