import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Glossary() {
  const terms = [
    { term: "Opportunity", definition: "A potential government contract or project that your company could bid on." },
    { term: "Proposal", definition: "Your formal response to a government solicitation or RFP." },
    { term: "Contract", definition: "An awarded agreement between your company and the government." },
    { term: "Modification", definition: "An official change to an existing contract." },
    { term: "Deliverable", definition: "A specific product or service you must deliver under the contract." },
    { term: "Compliance", definition: "Meeting all requirements and regulations specified in the contract." },
    { term: "Closeout", definition: "The final administrative process to close out a completed contract." },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Glossary</h1>
          <p className="text-gray-600">Common terms and definitions used in government contracting</p>
        </div>

        <div className="space-y-4">
          {terms.map((item, idx) => (
            <div key={idx} className="bg-white/10 backdrop-blur border border-white/20 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-2">{item.term}</h3>
              <p className="text-gray-600">{item.definition}</p>
            </div>
          ))}
        </div>

        <div className="mt-12">
          <Link href="/">
            <Button variant="outline" className="border-white text-white hover:bg-white/10">
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
