import { HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface FieldHelpProps {
  field: string;
  context?: string;
}

// Government contracting field help definitions
const fieldHelp: Record<string, string> = {
  // Opportunity fields
  title: "The official title of the opportunity as listed on SAM.gov or the solicitation document.",
  agency: "The federal agency or department issuing the solicitation (e.g., Department of Defense, GSA).",
  solicitation: "The unique solicitation number assigned by the contracting office (e.g., W911NF-24-R-0001).",
  naics: "North American Industry Classification System code. Determines your size standard and eligibility for set-asides.",
  setAside: "Indicates if the opportunity is restricted to specific business categories (Small Business, 8(a), HUBZone, SDVOSB, WOSB).",
  dueDate: "The deadline for proposal submission. Late submissions are typically rejected without consideration.",
  type: "The solicitation type: RFP (Request for Proposal), RFI (Request for Information), RFQ (Request for Quote), Sources Sought.",
  sourceLink: "URL to the original opportunity listing on SAM.gov or the agency's procurement website.",

  // Contract fields
  contractNumber: "The official contract number assigned upon award (e.g., FA8750-24-C-0001). Used for all official correspondence.",
  value: "Total contract value including all option years and CLINs. This is the ceiling amount.",
  startDate: "Period of Performance (PoP) start date. Work should not begin before this date.",
  endDate: "Period of Performance (PoP) end date. All work and deliverables must be completed by this date.",
  contractType: "The contract type determines risk allocation: FFP (Firm Fixed Price), T&M (Time & Materials), CPFF (Cost Plus Fixed Fee).",

  // Proposal fields
  framework: "The proposal structure/framework: e.g., Technical/Management/Past Performance, or as specified in Section L.",
  complianceMatrix: "A matrix mapping each solicitation requirement to your proposal response. Ensures nothing is missed.",
  evaluationCriteria: "The criteria the government will use to evaluate proposals, typically found in Section M.",

  // Invoice fields
  invoiceNumber: "Your unique invoice number. Must be sequential and traceable for audit purposes.",
  amount: "The dollar amount being invoiced. Must align with contract rates and CLIN pricing.",
  period: "The billing period covered by this invoice (e.g., monthly, milestone-based).",
  clins: "Contract Line Item Numbers. Each CLIN has specific pricing and deliverables.",

  // General
  status: "Current status in the workflow. Status changes may trigger compliance checks and notifications.",
  priority: "Priority level for internal tracking. Does not affect government evaluation.",
  assignee: "Team member responsible for this item. Important for accountability and workload management.",
  description: "Detailed description. For proposals, align with solicitation language and evaluation criteria.",
  category: "Classification category for organization and filtering.",
  tags: "Custom tags for additional categorization and quick filtering.",
};

export default function FieldHelp({ field, context }: FieldHelpProps) {
  const helpText = fieldHelp[field];
  if (!helpText) return null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <HelpCircle className="h-3.5 w-3.5 text-muted-foreground hover:text-blue-500 cursor-help inline-block ml-1" />
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <p className="text-xs">{helpText}</p>
          {context && <p className="text-[10px] text-muted-foreground mt-1">Context: {context}</p>}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
