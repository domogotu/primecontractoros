import { AlertCircle, TrendingDown, Users, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LossReview() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-orange-50 p-6 rounded-lg border border-orange-200">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Proposal Loss Review</h1>
        <p className="text-slate-600">Turn losses into learning. Document debrief, strengths, weaknesses, and improvements.</p>
      </div>

      {/* Proposal Info */}
      <div className="bg-white p-6 rounded-lg border border-slate-200">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Defense IT Infrastructure Modernization</h3>
            <p className="text-sm text-slate-600 mt-1">RFQ N00123-26-R-0045 • Submitted April 15, 2026</p>
          </div>
          <span className="text-xs px-3 py-1 rounded-full font-medium bg-red-100 text-red-800">Not Selected</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-50 rounded border border-slate-200">
          <div>
            <p className="text-xs text-slate-600 font-medium mb-1">Decision Date</p>
            <p className="text-sm font-medium text-slate-900">May 1, 2026</p>
          </div>
          <div>
            <p className="text-xs text-slate-600 font-medium mb-1">Debrief Requested</p>
            <p className="text-sm font-medium text-slate-900">Yes • May 3, 2026</p>
          </div>
          <div>
            <p className="text-xs text-slate-600 font-medium mb-1">Debrief Received</p>
            <p className="text-sm font-medium text-slate-900">Yes • May 4, 2026</p>
          </div>
        </div>
      </div>

      {/* Debrief Notes */}
      <div className="bg-white p-6 rounded-lg border border-slate-200">
        <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600" />
          Debrief Notes
        </h3>
        <div className="p-4 bg-blue-50 rounded border border-blue-200">
          <p className="text-sm text-slate-900">
            <strong>Agency Feedback:</strong> "Your technical approach was solid, but the selected contractor had prior experience with similar systems. Your cost was higher than the winning bid. Consider partnering with established contractors or gaining more direct experience in this domain."
          </p>
        </div>
      </div>

      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Strengths */}
        <div className="bg-white p-6 rounded-lg border border-slate-200">
          <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-green-600" />
            Proposal Strengths
          </h3>
          <div className="space-y-2">
            <div className="p-3 bg-green-50 rounded border border-green-200">
              <p className="text-sm text-slate-900">• Clear technical architecture aligned with government standards</p>
            </div>
            <div className="p-3 bg-green-50 rounded border border-green-200">
              <p className="text-sm text-slate-900">• Strong compliance and security posture</p>
            </div>
            <div className="p-3 bg-green-50 rounded border border-green-200">
              <p className="text-sm text-slate-900">• Experienced team with relevant certifications</p>
            </div>
            <div className="p-3 bg-green-50 rounded border border-green-200">
              <p className="text-sm text-slate-900">• Comprehensive implementation timeline</p>
            </div>
          </div>
          <textarea
            placeholder="Add other strengths..."
            className="w-full mt-3 p-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
            rows={2}
          />
        </div>

        {/* Weaknesses */}
        <div className="bg-white p-6 rounded-lg border border-slate-200">
          <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            Proposal Weaknesses
          </h3>
          <div className="space-y-2">
            <div className="p-3 bg-red-50 rounded border border-red-200">
              <p className="text-sm text-slate-900">• Limited direct experience with this specific system</p>
            </div>
            <div className="p-3 bg-red-50 rounded border border-red-200">
              <p className="text-sm text-slate-900">• Cost proposal higher than winning bid</p>
            </div>
            <div className="p-3 bg-red-50 rounded border border-red-200">
              <p className="text-sm text-slate-900">• No prior contracts with this agency</p>
            </div>
            <div className="p-3 bg-red-50 rounded border border-red-200">
              <p className="text-sm text-slate-900">• Limited past performance references in this domain</p>
            </div>
          </div>
          <textarea
            placeholder="Add other weaknesses..."
            className="w-full mt-3 p-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
            rows={2}
          />
        </div>
      </div>

      {/* Lessons Learned */}
      <div className="bg-white p-6 rounded-lg border border-slate-200">
        <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-slate-600" />
          Lessons Learned & Improvements
        </h3>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-900 mb-2 block">What would we do differently?</label>
            <textarea
              placeholder="Document specific improvements for future proposals..."
              className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={3}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-900 mb-2 block">Template improvements needed?</label>
            <textarea
              placeholder="Note any changes to proposal templates or processes..."
              className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={3}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-900 mb-2 block">Partnership or experience gaps to address?</label>
            <textarea
              placeholder="Document gaps that could be filled through partnerships or skill development..."
              className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={3}
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
        <h3 className="font-semibold text-slate-900 mb-4">Improvement Actions</h3>
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-3 p-3 bg-white rounded border border-slate-200">
            <input type="checkbox" className="w-4 h-4" />
            <span className="text-sm text-slate-900">Research partnership opportunities with system integrators</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-white rounded border border-slate-200">
            <input type="checkbox" className="w-4 h-4" />
            <span className="text-sm text-slate-900">Pursue relevant certifications or training</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-white rounded border border-slate-200">
            <input type="checkbox" className="w-4 h-4" />
            <span className="text-sm text-slate-900">Review and update cost estimation methodology</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-white rounded border border-slate-200">
            <input type="checkbox" className="w-4 h-4" />
            <span className="text-sm text-slate-900">Build case studies from related past performance</span>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline">Save Draft</Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">Complete Loss Review</Button>
        </div>
      </div>
    </div>
  );
}
