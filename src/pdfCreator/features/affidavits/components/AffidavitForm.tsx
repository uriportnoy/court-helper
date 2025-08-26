import React, { useState } from "react";
import { AffidavitProps } from "../types";
import { parseDate, formatDate } from "../utils/date";
import { ChevronDown, ChevronUp } from "lucide-react";

export const AffidavitForm: React.FC<AffidavitProps> = ({ data, onChange }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Collapsed View */}
      <div
        className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={toggleExpanded}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <h2 className="text-base font-semibold">פרטי תצהיר</h2>
            <span className="text-gray-400">|</span>
            <span>{data.name}</span>
            <span className="text-gray-400">•</span>
            <span className="text-gray-600">ת.ז. {data.id}</span>
            <span className="text-gray-400">•</span>
            <span className="text-gray-600">{data.date}</span>
            <span className="text-gray-400">•</span>
            <span className="text-gray-600">עו"ד {data.lawyer}</span>
            <span className="text-gray-400">•</span>
            <span className="text-gray-600">
              {data.isRemote ? "מרחוק" : "פרונטלי"}
            </span>
          </div>
          <div className="text-gray-400">
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
        </div>
      </div>

      {/* Expanded Form */}
      {isExpanded && (
        <div className="p-6 border-t border-gray-200">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  שם
                </label>
                <input
                  type="text"
                  value={data.name}
                  onChange={(e) => onChange({ ...data, name: e.target.value })}
                  className="form-input block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  תעודת זהות
                </label>
                <input
                  type="text"
                  value={data.id}
                  onChange={(e) => onChange({ ...data, id: e.target.value })}
                  className="form-input block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  תאריך
                </label>
                <input
                  type="date"
                  value={parseDate(data.date)}
                  onChange={(e) =>
                    onChange({ ...data, date: formatDate(e.target.value) })
                  }
                  className="form-input block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  שם עורך דין
                </label>
                <input
                  type="text"
                  value={data.lawyer}
                  onChange={(e) =>
                    onChange({ ...data, lawyer: e.target.value })
                  }
                  className="form-input block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                מספר תצהיר
              </label>
              <input
                type="text"
                value={data.comment}
                onChange={(e) => onChange({ ...data, comment: e.target.value })}
                className="form-input block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                סוג תצהיר
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onChange({ ...data, isRemote: true })}
                  className={`px-3 py-2 text-sm font-medium rounded-md ${
                    data.isRemote
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : "bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  אישור עו"ד מרחוק
                </button>
                <button
                  onClick={() => onChange({ ...data, isRemote: false })}
                  className={`px-3 py-2 text-sm font-medium rounded-md ${
                    !data.isRemote
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : "bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  אישור עו"ד פרונטלי
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="withSignature"
                  checked={data.withSignature}
                  onChange={(e) =>
                    onChange({
                      ...data,
                      withSignature: e.target.checked,
                    })
                  }
                  className="form-checkbox h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <label
                  htmlFor="withSignature"
                  className="mr-2 text-sm text-gray-700"
                >
                  כולל חתימות
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
