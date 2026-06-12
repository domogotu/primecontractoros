// @ts-nocheck
import { getDb } from "../db";
import { helpArticles, glossaryTerms, contextualHelpItems } from "../../drizzle/schema";
import { HELP_ARTICLES, GLOSSARY_TERMS, CONTEXTUAL_HELP_DATA } from "./helpContent";
import { eq, sql } from "drizzle-orm";

let seeded = false;

/**
 * Seeds help articles, glossary terms, and contextual help items if they don't exist.
 * Called lazily on first access.
 */
export async function ensureHelpContentSeeded(): Promise<void> {
  if (seeded) return;
  const db = await getDb();
  if (!db) return;

  try {
    // Check if articles exist
    const [articleCount] = await db.select({ count: sql<number>`count(*)` }).from(helpArticles);
    if (!articleCount?.count || articleCount.count === 0) {
      for (const article of HELP_ARTICLES) {
        try {
          await db.insert(helpArticles).values(article);
        } catch (e) {
          // Skip duplicates
        }
      }
    }

    // Check if glossary terms exist
    const [termCount] = await db.select({ count: sql<number>`count(*)` }).from(glossaryTerms);
    if (!termCount?.count || termCount.count === 0) {
      for (const term of GLOSSARY_TERMS) {
        try {
          await db.insert(glossaryTerms).values(term);
        } catch (e) {
          // Skip duplicates
        }
      }
    }

    // Check if contextual help exists
    const [helpCount] = await db.select({ count: sql<number>`count(*)` }).from(contextualHelpItems);
    if (!helpCount?.count || helpCount.count === 0) {
      for (const item of CONTEXTUAL_HELP_DATA) {
        try {
          await db.insert(contextualHelpItems).values({
            ...item,
            audience: "customer",
            isActive: true,
          });
        } catch (e) {
          // Skip duplicates
        }
      }
    }

    seeded = true;
  } catch (e) {
    // Tables may not exist yet, that's fine
    console.log("Help content seeding skipped (tables may not exist yet)");
  }
}
