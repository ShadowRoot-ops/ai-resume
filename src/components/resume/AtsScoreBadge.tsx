// src/components/resume/AtsScoreBadge.tsx
import React from "react";

interface AtsScoreBadgeProps {
  score: number;
}

const AtsScoreBadge: React.FC<AtsScoreBadgeProps> = ({ score }) => {
  let badgeClass = "";
  let label = "";

  if (score < 60) {
    badgeClass = "bg-red-100 text-red-800 border-red-200";
    label = "Poor";
  } else if (score < 75) {
    badgeClass = "bg-yellow-100 text-yellow-800 border-yellow-200";
    label = "Good";
  } else if (score < 90) {
    badgeClass = "bg-blue-100 text-blue-800 border-blue-200";
    label = "Better";
  } else {
    badgeClass = "bg-green-100 text-green-800 border-green-200";
    label = "Best";
  }

  return (
    <div
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium border ${badgeClass}`}
    >
      {label}: {score}/100
    </div>
  );
};

export default AtsScoreBadge;
