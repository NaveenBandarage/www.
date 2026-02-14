import React from "react";

interface Request {
  companyName: string;
  count: number;
}

interface PendingRequestsProps {
  requests: Request[];
}

export default function PendingRequests({ requests }: PendingRequestsProps) {
  if (requests.length === 0) {
    return null;
  }

  return (
    <div className="mb-6 rounded-xl border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900/30 dark:bg-yellow-900/10">
      <h3 className="mb-3 text-sm font-medium text-yellow-900 dark:text-yellow-200 [font-variation-settings:'wght'_500]">
        Current Pending Requests ({requests.length})
      </h3>
      <div className="space-y-2">
        {requests.map((request, index) => (
          <div
            key={index}
            className="flex items-center justify-between text-sm"
          >
            <span className="text-yellow-800 dark:text-yellow-300">
              {request.companyName}
            </span>
            <span className="text-yellow-600 dark:text-yellow-400">
              {request.count} {request.count === 1 ? "vote" : "votes"}
            </span>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs italic text-yellow-700 dark:text-yellow-400">
        Vote for your preferred company or submit your own request below
      </p>
    </div>
  );
}
