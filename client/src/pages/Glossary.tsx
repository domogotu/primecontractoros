import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useState } from "react";
import Footer from "@/components/Footer";

const glossaryTerms = [
  { term: "FAR", definition: "Federal Acquisition Regulation. The primary regulation governing the acquisition process for all federal executive agencies. Codified in Title 48 of the Code of Federal Regulations." },
  { term: "DFARS", definition: "Defense Federal Acquisition Regulation Supplement. Additional acquisition regulations specific to the Department of Defense that supplement the FAR." },
  { term: "NAICS Code", definition: "North American Industry Classification System code. A 6-digit code used to classify businesses by industry sector. Required for government contracting to identify eligible set-aside opportunities." },
  { term: "SAM.gov", definition: "System for Award Management. The official government system where contractors must register to do business with the federal government. Registration is required before receiving any contract award." },
  { term: "UEI", definition: "Unique Entity Identifier. A 12-character alphanumeric ID assigned by SAM.gov that uniquely identifies entities doing business with the federal government. Replaced the DUNS number in 2022." },
  { term: "CAGE Code", definition: "Commercial and Government Entity Code. A 5-character code assigned by DLA that identifies companies doing business with the federal government." },
  { term: "Set-Aside", definition: "A contracting method where competition is restricted to specific categories of small businesses (8(a), HUBZone, SDVOSB, WOSB). Used to meet small business contracting goals." },
  { term: "8(a) Program", definition: "SBA business development program for small disadvantaged businesses. Provides access to sole-source and competitive set-aside contracts, mentoring, and business development assistance." },
  { term: "HUBZone", definition: "Historically Underutilized Business Zone. SBA program that provides contracting preferences to small businesses located in designated areas with high unemployment or low income." },
  { term: "SDVOSB", definition: "Service-Disabled Veteran-Owned Small Business. A designation for businesses owned and controlled by service-disabled veterans, eligible for set-aside contracts." },
  { term: "WOSB", definition: "Women-Owned Small Business. Federal contracting program providing set-aside opportunities for businesses owned and controlled by women." },
  { term: "Prime Contractor", definition: "The contractor that holds the direct contract with the government agency. Responsible for overall contract performance and may subcontract portions of the work." },
  { term: "Subcontractor", definition: "A company that performs work under a contract held by a prime contractor. Does not have a direct contractual relationship with the government." },
  { term: "Solicitation", definition: "A formal request from the government for proposals or bids. Includes the statement of work, evaluation criteria, and contract terms. Published on SAM.gov or agency-specific portals." },
  { term: "RFP", definition: "Request for Proposal. A solicitation method used in negotiated procurements where the government evaluates proposals based on technical approach, past performance, and price." },
  { term: "RFQ", definition: "Request for Quotation. A solicitation method typically used for commercial items or simplified acquisitions where price is the primary evaluation factor." },
  { term: "IFB", definition: "Invitation for Bid. A solicitation method used in sealed bidding where award goes to the lowest responsive, responsible bidder." },
  { term: "FFP", definition: "Firm-Fixed-Price. A contract type where the contractor agrees to deliver at a set price regardless of actual costs. Places maximum risk on the contractor." },
  { term: "T&M", definition: "Time and Materials. A contract type where the government pays fixed hourly rates plus actual material costs. Used when work scope cannot be precisely defined." },
  { term: "CPFF", definition: "Cost-Plus-Fixed-Fee. A contract type where the government reimburses allowable costs plus a fixed fee. Used for research, development, or high-uncertainty work." },
  { term: "IDIQ", definition: "Indefinite Delivery/Indefinite Quantity. A contract that provides for an indefinite quantity of supplies or services during a fixed period. Task orders are issued against the contract." },
  { term: "Task Order", definition: "An order issued under an IDIQ or BPA contract for specific work. Defines the scope, period of performance, and funding for a particular effort." },
  { term: "GFE/GFP", definition: "Government-Furnished Equipment/Property. Equipment or property provided by the government to the contractor for use in performing the contract." },
  { term: "COR", definition: "Contracting Officer's Representative. A government employee designated to monitor contractor performance and serve as the technical point of contact." },
  { term: "CO", definition: "Contracting Officer. The government official with authority to enter into, administer, and terminate contracts. The only person who can legally bind the government." },
  { term: "CPARS", definition: "Contractor Performance Assessment Reporting System. The government system used to document contractor past performance evaluations on completed contracts." },
  { term: "Past Performance", definition: "A contractor's record of performance on previous contracts. Used as an evaluation factor in source selection to predict future performance." },
  { term: "Modification", definition: "A written change to a contract. Can be unilateral (by the CO) or bilateral (agreed by both parties). Used to change scope, price, schedule, or terms." },
  { term: "Closeout", definition: "The process of completing all administrative actions on a contract after physical completion. Governed by FAR 4.804, includes final payment, property disposition, and file retention." },
  { term: "FAR 4.804", definition: "The FAR section governing contract closeout procedures. Specifies timeframes, required actions, and documentation for closing out completed contracts." },
  { term: "Deliverable", definition: "A tangible or intangible item that the contractor must provide to the government under the contract. Can include reports, hardware, software, or services." },
  { term: "CLIN", definition: "Contract Line Item Number. A numbered item in a contract that identifies specific supplies or services to be delivered, along with quantity and price." },
  { term: "Period of Performance", definition: "The timeframe during which the contractor must complete the work specified in the contract. Includes base period and any option periods." },
  { term: "Option Period", definition: "An additional period of performance that the government may exercise at its discretion. Typically follows the base period and is priced at contract award." },
  { term: "Capability Statement", definition: "A document that summarizes a company's core competencies, past performance, certifications, and differentiators. Used to market to government agencies and prime contractors." },
  { term: "Teaming Agreement", definition: "A formal agreement between two or more companies to pursue a specific government contract opportunity together. Defines roles, responsibilities, and work share." },
];

export default function Glossary() {
  const [, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredTerms = glossaryTerms.filter(
    (item) =>
      item.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.definition.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Navigation */}
      <nav className="border-b border-gray-200 sticky top-0 bg-white/95 backdrop-blur z-50">
        <div className="container flex items-center justify-between py-4">
          <button onClick={() => navigate("/")} className="text-2xl font-bold text-primary">
            PrimeContractorOS
          </button>
          <div className="flex gap-4">
            <Button variant="ghost" onClick={() => navigate("/")}>Home</Button>
            <Button variant="ghost" onClick={() => navigate("/help")}>Help</Button>
            <Button variant="ghost" onClick={() => navigate("/pricing")}>Pricing</Button>
            <Button variant="outline" onClick={() => navigate("/login")}>Sign In</Button>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="py-12 md:py-16 border-b border-gray-200">
        <div className="container max-w-4xl">
          <h1 className="text-4xl font-bold mb-4">Government Contracting Glossary</h1>
          <p className="text-lg text-gray-500 mb-6">
            {glossaryTerms.length} essential terms and definitions for government contractors. From FAR regulations to contract types and business certifications.
          </p>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search terms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-lg bg-input border border-gray-200 text-gray-900 placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>
      </section>

      {/* Terms */}
      <section className="py-12 flex-1">
        <div className="container max-w-4xl">
          {filteredTerms.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No terms found matching your search.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTerms.map((item, idx) => (
                <div key={idx} className="p-5 rounded-lg bg-white border border-gray-200">
                  <h3 className="font-semibold text-gray-900 text-lg mb-2">{item.term}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.definition}</p>
                </div>
              ))}
            </div>
          )}
          <div className="mt-8 text-center text-sm text-gray-500">
            Showing {filteredTerms.length} of {glossaryTerms.length} terms
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
