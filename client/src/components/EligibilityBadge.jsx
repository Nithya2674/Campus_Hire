import React, { useState } from 'react';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';

export const EligibilityBadge = ({ isEligible, reasons = [], showDetailsButton = true }) => {
  const [showModal, setShowModal] = useState(false);

  if (isEligible === null || isEligible === undefined) {
    return null;
  }

  return (
    <>
      <div className="inline-flex items-center gap-1.5">
        {isEligible ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Eligible
          </span>
        ) : (
          <div className="inline-flex items-center gap-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
              <XCircle className="w-3.5 h-3.5 text-amber-600" />
              Not Eligible
            </span>
            {showDetailsButton && reasons && reasons.length > 0 && (
              <button
                type="button"
                onClick={() => setShowModal(true)}
                title="View ineligibility reasons"
                className="text-slate-400 hover:text-slate-600 transition p-0.5 rounded-full"
              >
                <Info className="w-4 h-4 text-amber-700" />
              </button>
            )}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100 animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                <XCircle className="w-5 h-5 text-amber-600" />
                Eligibility Criteria Reasons
              </h4>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-2">
              <p className="text-xs text-slate-500 mb-2">
                You do not meet the criteria specified by the recruiter for this job posting:
              </p>
              <ul className="space-y-2">
                {reasons.map((r, i) => (
                  <li
                    key={i}
                    className="text-sm text-slate-700 bg-amber-50/70 border border-amber-200/60 p-2.5 rounded-xl flex items-start gap-2"
                  >
                    <span className="text-amber-600 font-bold">•</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-medium transition"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EligibilityBadge;
