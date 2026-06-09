/**
 * SAM.gov API Integration Service
 * 
 * Provides search for contract opportunities and entity data
 * using the official SAM.gov API.
 */

const SAM_OPPORTUNITIES_URL = "https://api.sam.gov/opportunities/v2/search";
const SAM_ENTITY_URL = "https://api.sam.gov/entity-information/v3/entities";

/**
 * Get SAM.gov API key from environment variable.
 * Workspace-level keys can be stored in workspaceSettings under key "sam_gov_api_key"
 * and passed explicitly to functions that need it.
 */
export function getSamApiKey(workspaceApiKey?: string | null): string {
  return workspaceApiKey || process.env.SAM_GOV_API_KEY || "";
}

// Default key for backward compatibility
const SAM_API_KEY = process.env.SAM_GOV_API_KEY || "";

export interface SamOpportunity {
  noticeId: string;
  title: string;
  solicitationNumber: string;
  department: string;
  subTier: string;
  office: string;
  postedDate: string;
  type: string;
  baseType: string;
  archiveType: string;
  archiveDate: string;
  responseDeadLine: string;
  naicsCode: string;
  classificationCode: string;
  active: string;
  description: string;
  organizationType: string;
  uiLink: string;
  setAside: string;
  setAsideDescription: string;
  placeOfPerformance?: {
    city?: { code: string; name: string };
    state?: { code: string; name: string };
    country?: { code: string; name: string };
  };
  pointOfContact?: Array<{
    type: string;
    fullName: string;
    email: string;
    phone: string;
  }>;
}

export interface SamEntity {
  ueiSAM: string;
  ueiDUNS: string;
  entityEFTIndicator: string;
  cageCode: string;
  dodaac: string;
  legalBusinessName: string;
  dbaName: string;
  physicalAddress: {
    addressLine1: string;
    city: string;
    stateOrProvinceCode: string;
    zipCode: string;
    countryCode: string;
  };
  entityStartDate: string;
  fiscalYearEndCloseDate: string;
  registrationStatus: string;
  registrationDate: string;
  lastUpdateDate: string;
  expirationDate: string;
  activeDate: string;
  naicsCode: string[];
  pscCode: string[];
  sbaBusinessTypeDesc: string[];
}

export interface SamSearchParams {
  keyword?: string;
  naicsCode?: string;
  setAside?: string;
  postedFrom?: string;
  postedTo?: string;
  responseDeadlineFrom?: string;
  responseDeadlineTo?: string;
  status?: string;
  limit?: number;
  offset?: number;
  sortBy?: string;
}

export interface SamEntitySearchParams {
  ueiSAM?: string;
  cageCode?: string;
  legalBusinessName?: string;
  stateCode?: string;
  naicsCode?: string;
  limit?: number;
  offset?: number;
}

/**
 * Search SAM.gov contract opportunities
 */
export async function searchOpportunities(params: SamSearchParams): Promise<{
  opportunities: SamOpportunity[];
  totalRecords: number;
  error?: string;
}> {
  try {
    const queryParams = new URLSearchParams();
    queryParams.set("api_key", SAM_API_KEY);
    
    if (params.keyword) queryParams.set("keyword", params.keyword);
    if (params.naicsCode) queryParams.set("naics", params.naicsCode);
    if (params.setAside) queryParams.set("typeOfSetAside", params.setAside);
    if (params.postedFrom) queryParams.set("postedFrom", params.postedFrom);
    if (params.postedTo) queryParams.set("postedTo", params.postedTo);
    if (params.responseDeadlineFrom) queryParams.set("rdlfrom", params.responseDeadlineFrom);
    if (params.responseDeadlineTo) queryParams.set("rdlto", params.responseDeadlineTo);
    if (params.status) queryParams.set("status", params.status);
    queryParams.set("limit", String(params.limit || 25));
    queryParams.set("offset", String(params.offset || 0));
    if (params.sortBy) queryParams.set("orderBy", params.sortBy);

    const url = `${SAM_OPPORTUNITIES_URL}?${queryParams.toString()}`;
    const response = await fetch(url, {
      headers: { "Accept": "application/json" },
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[SAM.gov] Opportunity search failed:", response.status, errorText);
      return { opportunities: [], totalRecords: 0, error: `SAM.gov API error: ${response.status}` };
    }

    const data = await response.json();
    const opportunities: SamOpportunity[] = (data.opportunitiesData || []).map((opp: any) => ({
      noticeId: opp.noticeId || "",
      title: opp.title || "",
      solicitationNumber: opp.solicitationNumber || "",
      department: opp.department || opp.fullParentPathName?.split(".")?.at(0) || "",
      subTier: opp.subtierAgency || "",
      office: opp.office || "",
      postedDate: opp.postedDate || "",
      type: opp.type || "",
      baseType: opp.baseType || "",
      archiveType: opp.archiveType || "",
      archiveDate: opp.archiveDate || "",
      responseDeadLine: opp.responseDeadLine || "",
      naicsCode: opp.naicsCode || "",
      classificationCode: opp.classificationCode || "",
      active: opp.active || "Yes",
      description: (opp.description || "").substring(0, 2000),
      organizationType: opp.organizationType || "",
      uiLink: opp.uiLink || `https://sam.gov/opp/${opp.noticeId}/view`,
      setAside: opp.typeOfSetAside || "",
      setAsideDescription: opp.typeOfSetAsideDescription || "",
      placeOfPerformance: opp.placeOfPerformance,
      pointOfContact: opp.pointOfContact,
    }));

    return {
      opportunities,
      totalRecords: data.totalRecords || opportunities.length,
    };
  } catch (error: any) {
    console.error("[SAM.gov] Opportunity search error:", error.message);
    return { opportunities: [], totalRecords: 0, error: error.message };
  }
}

/**
 * Search SAM.gov entity registration data
 */
export async function searchEntities(params: SamEntitySearchParams): Promise<{
  entities: SamEntity[];
  totalRecords: number;
  error?: string;
}> {
  try {
    const queryParams = new URLSearchParams();
    queryParams.set("api_key", SAM_API_KEY);
    
    if (params.ueiSAM) queryParams.set("ueiSAM", params.ueiSAM);
    if (params.cageCode) queryParams.set("cageCode", params.cageCode);
    if (params.legalBusinessName) queryParams.set("legalBusinessName", params.legalBusinessName);
    if (params.stateCode) queryParams.set("physicalAddress.stateOrProvinceCode", params.stateCode);
    if (params.naicsCode) queryParams.set("naicsCode", params.naicsCode);
    queryParams.set("registrationStatus", "A");
    queryParams.set("includeSections", "entityRegistration,coreData");
    queryParams.set("limit", String(params.limit || 10));
    queryParams.set("offset", String(params.offset || 0));

    const url = `${SAM_ENTITY_URL}?${queryParams.toString()}`;
    const response = await fetch(url, {
      headers: { "Accept": "application/json" },
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[SAM.gov] Entity search failed:", response.status, errorText);
      return { entities: [], totalRecords: 0, error: `SAM.gov API error: ${response.status}` };
    }

    const data = await response.json();
    const entities: SamEntity[] = (data.entityData || []).map((entity: any) => {
      const reg = entity.entityRegistration || {};
      const core = entity.coreData || {};
      const addr = core.physicalAddress || {};
      return {
        ueiSAM: reg.ueiSAM || "",
        ueiDUNS: reg.ueiDUNS || "",
        entityEFTIndicator: reg.entityEFTIndicator || "",
        cageCode: reg.cageCode || "",
        dodaac: reg.dodaac || "",
        legalBusinessName: reg.legalBusinessName || "",
        dbaName: reg.dbaName || "",
        physicalAddress: {
          addressLine1: addr.addressLine1 || "",
          city: addr.city || "",
          stateOrProvinceCode: addr.stateOrProvinceCode || "",
          zipCode: addr.zipCode || "",
          countryCode: addr.countryCode || "",
        },
        entityStartDate: reg.entityStartDate || "",
        fiscalYearEndCloseDate: reg.fiscalYearEndCloseDate || "",
        registrationStatus: reg.registrationStatus || "",
        registrationDate: reg.registrationDate || "",
        lastUpdateDate: reg.lastUpdateDate || "",
        expirationDate: reg.expirationDate || "",
        activeDate: reg.activeDate || "",
        naicsCode: (core.naicsCode || []).map((n: any) => n.naicsCode || n),
        pscCode: (core.pscCode || []).map((p: any) => p.pscCode || p),
        sbaBusinessTypeDesc: (core.sbaBusinessTypeDesc || []),
      };
    });

    return {
      entities,
      totalRecords: data.totalRecords || entities.length,
    };
  } catch (error: any) {
    console.error("[SAM.gov] Entity search error:", error.message);
    return { entities: [], totalRecords: 0, error: error.message };
  }
}

/**
 * Get a single opportunity by notice ID
 */
export async function getOpportunityByNoticeId(noticeId: string): Promise<SamOpportunity | null> {
  try {
    const queryParams = new URLSearchParams();
    queryParams.set("api_key", SAM_API_KEY);
    queryParams.set("noticeid", noticeId);

    const url = `${SAM_OPPORTUNITIES_URL}?${queryParams.toString()}`;
    const response = await fetch(url, {
      headers: { "Accept": "application/json" },
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) return null;

    const data = await response.json();
    const opps = data.opportunitiesData || [];
    if (opps.length === 0) return null;

    const opp = opps[0];
    return {
      noticeId: opp.noticeId || "",
      title: opp.title || "",
      solicitationNumber: opp.solicitationNumber || "",
      department: opp.department || "",
      subTier: opp.subtierAgency || "",
      office: opp.office || "",
      postedDate: opp.postedDate || "",
      type: opp.type || "",
      baseType: opp.baseType || "",
      archiveType: opp.archiveType || "",
      archiveDate: opp.archiveDate || "",
      responseDeadLine: opp.responseDeadLine || "",
      naicsCode: opp.naicsCode || "",
      classificationCode: opp.classificationCode || "",
      active: opp.active || "Yes",
      description: (opp.description || "").substring(0, 2000),
      organizationType: opp.organizationType || "",
      uiLink: opp.uiLink || `https://sam.gov/opp/${opp.noticeId}/view`,
      setAside: opp.typeOfSetAside || "",
      setAsideDescription: opp.typeOfSetAsideDescription || "",
      placeOfPerformance: opp.placeOfPerformance,
      pointOfContact: opp.pointOfContact,
    };
  } catch (error) {
    console.error("[SAM.gov] Get opportunity error:", error);
    return null;
  }
}
