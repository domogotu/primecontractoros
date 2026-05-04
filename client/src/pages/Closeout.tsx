import { AlertCircle, CheckCircle2, FileText, Users, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Closeout() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-red-50 p-6 rounded-lg border border-red-200">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Contract Closeout</h1>
        <p className="text-slate-600">Structured contract closure. Confirm all requirements met before marking complete.</p>
      </div>

      {/* Blocking Items */}
      <div className="bg-white p-6 rounded-lg border border-slate-200">
        <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600" />
          Blocking Items (3)
        </h3>
        <div className="space-y-3">
          <div className="p-4 bg-red-50 rounded border border-red-200">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-red-600 flex items-center justify-center">
                <span className="text-white text-sm font-bold">1</span>
              </div>
              <div className="flex-1">
                <p className="font-medium text-slate-900">Final Deliverable Not Submitted</p>
                <p className="text-sm text-slate-600 mt-1">Training materials final version due by May 31</p>
              </div>
            </div>
          </div>
          <div className="p-4 bg-red-50 rounded border border-red-200">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-red-600 flex items-center justify-center">
                <span className="text-white text-sm font-bold">2</span>
              </div>
              <div className="flex-1">
                <p className="font-medium text-slate-900">Outstanding Invoice</p>
                <p className="text-sm text-slate-600 mt-1">INV-2026-003 for $45,000 still unpaid</p>
              </div>
            </div>
          </div>
          <div className="p-4 bg-red-50 rounded border border-red-200">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-red-600 flex items-center justify-center">
                <span className="text-white text-sm font-bold">3</span>
              </div>
              <div className="flex-1">
                <p className="font-medium text-slate-900">Compliance Evidence Missing</p>
                <p className="text-sm text-slate-600 mt-1">Final DFARS compliance certification not received</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Closeout Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Requirements */}
        <div className="bg-white p-6 rounded-lg border border-slate-200">
          <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Requirements (5)
          </h3>
          <div className="space-y-2">
            <div className="flex items-center gap-3 p-2 bg-slate-50 rounded">
              <input type="checkbox" className="w-4 h-4" defaultChecked />
              <span className="text-sm text-slate-900 line-through">Monthly status reports</span>
            </div>
            <div className="flex items-center gap-3 p-2 bg-red-50 rounded border border-red-200">
              <input type="checkbox" className="w-4 h-4" />
              <span className="text-sm text-slate-900">Final training materials</span>
            </div>
            <div className="flex items-center gap-3 p-2 bg-slate-50 rounded">
              <input type="checkbox" className="w-4 h-4" defaultChecked />
              <span className="text-sm text-slate-900 line-through">User documentation</span>
            </div>
            <div className="flex items-center gap-3 p-2 bg-slate-50 rounded">
              <input type="checkbox" className="w-4 h-4" defaultChecked />
              <span className="text-sm text-slate-900 line-through">Support transition plan</span>
            </div>
            <div className="flex items-center gap-3 p-2 bg-red-50 rounded border border-red-200">
              <input type="checkbox" className="w-4 h-4" />
              <span className="text-sm text-slate-900">Final compliance certification</span>
            </div>
          </div>
        </div>

        {/* Finance */}
        <div className="bg-white p-6 rounded-lg border border-slate-200">
          <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            Finance Status
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded">
              <span className="text-sm text-slate-900">Total Billed</span>
              <span className="font-medium text-slate-900">$250,000</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 rounded border border-green-200">
              <span className="text-sm text-slate-900">Total Paid</span>
              <span className="font-medium text-green-900">$205,000</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-red-50 rounded border border-red-200">
              <span className="text-sm text-slate-900">Outstanding</span>
              <span className="font-medium text-red-900">$45,000</span>
            </div>
            <div className="p-3 bg-amber-50 rounded border border-amber-200">
              <p className="text-xs text-amber-700 font-medium">Action Required</p>
              <p className="text-sm text-amber-900 mt-1">Follow up on INV-2026-003 payment</p>
            </div>
          </div>
        </div>
      </div>

      {/* Lessons Learned */}
      <div className="bg-white p-6 rounded-lg border border-slate-200">
        <h3 className="font-semibold text-slate-900 mb-4">Lessons Learned</h3>
        <textarea
          placeholder="What did we learn from this contract? What would we do differently? What went well?"
          className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          rows={4}
        />
        <Button className="mt-3 bg-blue-600 hover:bg-blue-700 text-white">Save Lessons</Button>
      </div>

      {/* Final Review */}
      <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
        <h3 className="font-semibold text-slate-900 mb-4">Final Review</h3>
        <div className="space-y-3 mb-6">
          <label className="flex items-center gap-3 p-3 bg-white rounded border border-slate-200 cursor-pointer hover:bg-slate-50">
            <input type="checkbox" className="w-4 h-4" />
            <span className="text-sm text-slate-900">All deliverables received and accepted</span>
          </label>
          <label className="flex items-center gap-3 p-3 bg-white rounded border border-slate-200 cursor-pointer hover:bg-slate-50">
            <input type="checkbox" className="w-4 h-4" />
            <span className="text-sm text-slate-900">All invoices paid or accounted for</span>
          </label>
          <label className="flex items-center gap-3 p-3 bg-white rounded border border-slate-200 cursor-pointer hover:bg-slate-50">
            <input type="checkbox" className="w-4 h-4" />
            <span className="text-sm text-slate-900">All compliance requirements met</span>
          </label>
          <label className="flex items-center gap-3 p-3 bg-white rounded border border-slate-200 cursor-pointer hover:bg-slate-50">
            <input type="checkbox" className="w-4 h-4" />
            <span className="text-sm text-slate-900">Lessons learned documented</span>
          </label>
        </div>

        <div className="p-4 bg-amber-50 rounded border border-amber-200 mb-6">
          <p className="text-sm text-amber-800">
            <strong>Note:</strong> Cannot mark contract closed until all blocking items are resolved. Review the items above and complete required actions.
          </p>
        </div>

        <div className="flex gap-3">
          <Button variant="outline">Save Draft</Button>
          <Button className="bg-red-600 hover:bg-red-700 text-white" disabled>Mark Contract Closed</Button>
        </div>
      </div>
    </div>
  );
}
