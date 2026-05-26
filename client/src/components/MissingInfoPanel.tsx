import { AlertCircle, AlertTriangle, Info } from "lucide-react";

interface MissingField {
  field: string;
  label: string;
  tier: "red" | "amber" | "blue";
}

interface MissingInfoPanelProps {
  fields: MissingField[];
}

export default function MissingInfoPanel({ fields }: MissingInfoPanelProps) {
  if (fields.length === 0) return null;

  const redFields = fields.filter(f => f.tier === "red");
  const amberFields = fields.filter(f => f.tier === "amber");
  const blueFields = fields.filter(f => f.tier === "blue");

  return (
    <div className="space-y-2">
      {redFields.length > 0 && (
        <div className="flex items-start gap-2 p-2.5 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs font-medium text-red-800">Required to save</p>
            <p className="text-xs text-red-700 mt-0.5">
              {redFields.map(f => f.label).join(", ")}
            </p>
          </div>
        </div>
      )}

      {amberFields.length > 0 && (
        <div className="flex items-start gap-2 p-2.5 bg-amber-50 border border-amber-200 rounded-lg">
          <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs font-medium text-amber-800">Required before next stage</p>
            <p className="text-xs text-amber-700 mt-0.5">
              {amberFields.map(f => f.label).join(", ")}
            </p>
          </div>
        </div>
      )}

      {blueFields.length > 0 && (
        <div className="flex items-start gap-2 p-2.5 bg-blue-50 border border-blue-200 rounded-lg">
          <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs font-medium text-blue-800">Recommended</p>
            <p className="text-xs text-blue-700 mt-0.5">
              {blueFields.map(f => f.label).join(", ")}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
