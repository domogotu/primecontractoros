/**
 * SAM.gov Import Service
 * 
 * Handles URL validation, opportunity ID extraction, API fetching,
 * duplicate detection, field mapping, and attachment handling for
 * importing SAM.gov opportunities into PrimeContractorOS.
 */

import { getOpportunityByNoticeId, searchOpportunities, type SamOpportunity } from "./samGov";

const SAM_API_KEY = process.env.SAM_GOV_API_KEY || "";
const SAM_RESOURCES_URL = "https://api.sam.gov/opportunities/v1/search";

// ─── URL Validation & ID Extraction ────────────────────────────────────────────

/**
 * Validates that a URL is a SAM.gov opportunity URL.
 * Supports multiple URL formats:
 * - https://sam.gov/opp/{noticeId}/view
 * - https://sam.gov/workspace/contract/opp/{noticeId}/view
 * - https://www.sam.gov/opp/{noticeId}/view
 * - Direct notice ID strings
 */
export function validateSamGovUrl(url: string): { valid: boolean; error?: string } {
  if (!url || typeof url !== "string") {
    return { valid: false, error: "URL is required." };
  }

  const trimmed = url.trim();

  // Allow raw notice IDs (32-char hex)
  if (/^[a-f0-9]{32}$/i.test(trimmed)) {
    return { valid: true };
  }

  // Must be a sam.gov URL
  try {
    const parsed = new URL(trimmed);
    const hostname = parsed.hostname.toLowerCase();
    if (!hostname.includes("sam.gov")) {
      return { valid: false, error: "This is not a SAM.gov URL. Please paste a valid SAM.gov opportunity link." };
    }
  } catch {
    return { valid: false, error: "Invalid URL format. Please paste a valid SAM.gov opportunity URL." };
  }

  // Try to extract an ID
  const id = extractOpportunityId(trimmed);
  if (!id) {
    return { valid: false, error: "Could not find an opportunity identifier in this URL. Please confirm the URL points to a specific SAM.gov opportunity." };
  }

  return { valid: true };
}

/**
 * Extracts the SAM.gov opportunity/notice ID from a URL or raw string.
 */
export function extractOpportunityId(url: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();

  // Raw 32-char hex ID
  if (/^[a-f0-9]{32}$/i.test(trimmed)) {
    return trimmed;
  }

  // Pattern: /opp/{id}/view or /opp/{id}
  const oppMatch = trimmed.match(/\/opp\/([a-f0-9]{32})/i);
  if (oppMatch) return oppMatch[1];

  // Pattern: /opportunities/{id}
  const oppMatch2 = trimmed.match(/\/opportunities\/([a-f0-9]{32})/i);
  if (oppMatch2) return oppMatch2[1];

  // Pattern: noticeId= query param
  try {
    const parsed = new URL(trimmed);
    const noticeId = parsed.searchParams.get("noticeId") || parsed.searchParams.get("noticeid");
    if (noticeId && /^[a-f0-9]{32}$/i.test(noticeId)) return noticeId;
  } catch {}

  // Fallback: any 32-char hex in the URL path
  const fallback = trimmed.match(/[a-f0-9]{32}/i);
  if (fallback) return fallback[0];

  return null;
}

// ─── SAM.gov API Fetching ──────────────────────────────────────────────────────

export interface SamImportResult {
  success: boolean;
  opportunity?: SamOpportunity;
  attachments?: SamAttachment[];
  error?: string;
  apiStatusCode?: number;
  rawResponse?: string;
  isArchived?: boolean;
  isInactive?: boolean;
}

export interface SamAttachment {
  name: string;
  url: string;
  type?: string;
  description?: string;
  postedDate?: string;
}

/**
 * Fetches opportunity data from SAM.gov API using the notice ID.
 * Handles API errors, timeouts, missing keys, and archived opportunities.
 */
export async function fetchOpportunityFromSam(noticeId: string): Promise<SamImportResult> {
  // Check API key
  if (!SAM_API_KEY) {
    return {
      success: false,
      error: "SAM.gov API key is missing. Add the key in settings before importing opportunities.",
      apiStatusCode: 0,
    };
  }

  try {
    // First try the direct notice ID lookup
    const opportunity = await getOpportunityByNoticeId(noticeId);

    if (opportunity) {
      const isArchived = opportunity.archiveDate ? new Date(opportunity.archiveDate) < new Date() : false;
      const isInactive = opportunity.active === "No";

      // Fetch attachments
      const attachments = await fetchAttachments(noticeId);

      return {
        success: true,
        opportunity,
        attachments,
        isArchived,
        isInactive,
        apiStatusCode: 200,
      };
    }

    // If direct lookup fails, try searching by the ID as a keyword
    const searchResult = await searchOpportunities({
      keyword: noticeId,
      limit: 5,
    });

    if (searchResult.opportunities.length > 0) {
      const opp = searchResult.opportunities[0];
      const isArchived = opp.archiveDate ? new Date(opp.archiveDate) < new Date() : false;
      const isInactive = opp.active === "No";
      const attachments = await fetchAttachments(opp.noticeId || noticeId);

      return {
        success: true,
        opportunity: opp,
        attachments,
        isArchived,
        isInactive,
        apiStatusCode: 200,
      };
    }

    return {
      success: false,
      error: "No opportunity found with this ID on SAM.gov. The opportunity may have been removed or the ID may be incorrect.",
      apiStatusCode: 404,
    };
  } catch (error: any) {
    // Handle specific error types
    if (error.name === "AbortError" || error.message?.includes("timeout")) {
      return {
        success: false,
        error: "SAM.gov API request timed out. Please try again in a moment.",
        apiStatusCode: 408,
      };
    }

    if (error.message?.includes("429") || error.message?.includes("rate limit")) {
      return {
        success: false,
        error: "SAM.gov API rate limit reached. Please wait a minute and try again.",
        apiStatusCode: 429,
      };
    }

    return {
      success: false,
      error: `Failed to fetch opportunity from SAM.gov: ${error.message || "Unknown error"}`,
      apiStatusCode: 500,
      rawResponse: error.message,
    };
  }
}

/**
 * Fetches attachments/resources for an opportunity from SAM.gov.
 * Uses the resources endpoint if available.
 */
async function fetchAttachments(noticeId: string): Promise<SamAttachment[]> {
  try {
    const url = `https://api.sam.gov/opportunities/v1/noticeid/${noticeId}?api_key=${SAM_API_KEY}`;
    const response = await fetch(url, {
      headers: { "Accept": "application/json" },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      // Try alternate endpoint
      return await fetchAttachmentsAlternate(noticeId);
    }

    const data = await response.json();
    const attachments: SamAttachment[] = [];

    // Parse resourceLinks if present
    if (data?.resourceLinks && Array.isArray(data.resourceLinks)) {
      for (const link of data.resourceLinks) {
        attachments.push({
          name: link.name || link.title || "Unnamed Attachment",
          url: link.url || link.uri || "",
          type: link.type || link.mimeType || "unknown",
          description: link.description || "",
          postedDate: link.postedDate || "",
        });
      }
    }

    // Parse attachments array if present
    if (data?.attachments && Array.isArray(data.attachments)) {
      for (const att of data.attachments) {
        attachments.push({
          name: att.name || att.fileName || "Unnamed Attachment",
          url: att.url || att.accessUrl || "",
          type: att.type || att.mimeType || "unknown",
          description: att.description || "",
          postedDate: att.postedDate || "",
        });
      }
    }

    // Also check for related notices / amendments
    if (data?.relatedNotices && Array.isArray(data.relatedNotices)) {
      for (const notice of data.relatedNotices) {
        attachments.push({
          name: notice.title || `Related Notice: ${notice.noticeId}`,
          url: notice.uiLink || `https://sam.gov/opp/${notice.noticeId}/view`,
          type: "related_notice",
          description: notice.type || "",
          postedDate: notice.postedDate || "",
        });
      }
    }

    return attachments;
  } catch (error) {
    console.warn("[SAM Import] Could not fetch attachments:", error);
    return [];
  }
}

async function fetchAttachmentsAlternate(noticeId: string): Promise<SamAttachment[]> {
  try {
    // Try the v2 search with resource links
    const url = `https://api.sam.gov/opportunities/v2/search?api_key=${SAM_API_KEY}&noticeid=${noticeId}&limit=1`;
    const response = await fetch(url, {
      headers: { "Accept": "application/json" },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) return [];

    const data = await response.json();
    const opps = data?.opportunitiesData || [];
    if (opps.length === 0) return [];

    const opp = opps[0];
    const attachments: SamAttachment[] = [];

    // Check resourceLinks in the opportunity data
    if (opp.resourceLinks && Array.isArray(opp.resourceLinks)) {
      for (const link of opp.resourceLinks) {
        attachments.push({
          name: link.name || link.title || "Unnamed Attachment",
          url: link.url || link.uri || "",
          type: link.type || "unknown",
          description: link.description || "",
          postedDate: link.postedDate || "",
        });
      }
    }

    return attachments;
  } catch {
    return [];
  }
}

// ─── Field Mapping ─────────────────────────────────────────────────────────────

export interface MappedOpportunityData {
  title: string;
  agency: string | null;
  subAgency: string | null;
  office: string | null;
  solicitation: string | null;
  noticeId: string | null;
  samOpportunityId: string;
  samUrl: string | null;
  sourceSystem: string;
  sourceLink: string | null;
  naics: string | null;
  pscCode: string | null;
  setAside: string | null;
  setAsideDescription: string | null;
  noticeType: string | null;
  dueDate: Date | null;
  postedDate: Date | null;
  archiveDate: Date | null;
  type: string;
  summary: string | null;
  description: string | null;
  placeOfPerformance: string | null;
  pointOfContact: string | null;
  status: "new";
  reviewStatus: "needs_review";
  pursuitDecision: "undecided";
  importStatus: "imported";
}

/**
 * Maps SAM.gov API response data to PrimeContractorOS opportunity fields.
 */
export function mapSamDataToOpportunity(
  samOpp: SamOpportunity,
  originalUrl: string,
  noticeId: string
): MappedOpportunityData {
  // Parse place of performance
  let placeOfPerformance: string | null = null;
  if (samOpp.placeOfPerformance) {
    const pop = samOpp.placeOfPerformance;
    const parts: string[] = [];
    if (pop.city?.name) parts.push(pop.city.name);
    if (pop.state?.name) parts.push(pop.state.name);
    if (pop.country?.name && pop.country.name !== "United States") parts.push(pop.country.name);
    placeOfPerformance = parts.length > 0 ? parts.join(", ") : null;
  }

  // Parse point of contact
  let pointOfContact: string | null = null;
  if (samOpp.pointOfContact && samOpp.pointOfContact.length > 0) {
    pointOfContact = JSON.stringify(samOpp.pointOfContact);
  }

  // Parse dates safely
  const parseDate = (dateStr: string | undefined | null): Date | null => {
    if (!dateStr) return null;
    try {
      const d = new Date(dateStr);
      return isNaN(d.getTime()) ? null : d;
    } catch {
      return null;
    }
  };

  return {
    title: samOpp.title || "Untitled SAM.gov Opportunity",
    agency: samOpp.department || null,
    subAgency: samOpp.subTier || null,
    office: samOpp.office || null,
    solicitation: samOpp.solicitationNumber || null,
    noticeId: samOpp.noticeId || noticeId,
    samOpportunityId: noticeId,
    samUrl: samOpp.uiLink || originalUrl || null,
    sourceSystem: "SAM.gov",
    sourceLink: samOpp.uiLink || originalUrl || null,
    naics: samOpp.naicsCode || null,
    pscCode: samOpp.classificationCode || null,
    setAside: samOpp.setAside || null,
    setAsideDescription: samOpp.setAsideDescription || null,
    noticeType: samOpp.type || samOpp.baseType || null,
    dueDate: parseDate(samOpp.responseDeadLine),
    postedDate: parseDate(samOpp.postedDate),
    archiveDate: parseDate(samOpp.archiveDate),
    type: samOpp.baseType || samOpp.type || "federal",
    summary: samOpp.description ? samOpp.description.substring(0, 500) : null,
    description: samOpp.description || null,
    placeOfPerformance,
    pointOfContact,
    status: "new",
    reviewStatus: "needs_review",
    pursuitDecision: "undecided",
    importStatus: "imported",
  };
}

// ─── Duplicate Detection ───────────────────────────────────────────────────────

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  existingId?: number;
  matchField?: string;
}

/**
 * Check if an opportunity with the same SAM.gov ID already exists in the workspace.
 */
export async function checkForDuplicate(
  db: any,
  workspaceId: number,
  samOpportunityId: string,
  noticeId: string | null,
  solicitation: string | null,
  samUrl: string | null
): Promise<DuplicateCheckResult> {
  const { opportunities } = await import("../../drizzle/schema");
  const { eq, and, or, isNull } = await import("drizzle-orm");

  const conditions: any[] = [];
  
  if (samOpportunityId) {
    conditions.push(eq(opportunities.samOpportunityId, samOpportunityId));
  }
  if (noticeId) {
    conditions.push(eq(opportunities.noticeId, noticeId));
  }

  if (conditions.length === 0) return { isDuplicate: false };

  const existing = await db
    .select({ id: opportunities.id, samOpportunityId: opportunities.samOpportunityId, noticeId: opportunities.noticeId })
    .from(opportunities)
    .where(
      and(
        eq(opportunities.workspaceId, workspaceId),
        isNull(opportunities.deletedAt),
        or(...conditions)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    const match = existing[0];
    let matchField = "samOpportunityId";
    if (match.noticeId === noticeId) matchField = "noticeId";
    return { isDuplicate: true, existingId: match.id, matchField };
  }

  return { isDuplicate: false };
}
