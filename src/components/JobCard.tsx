import React from "react";
import { Job } from "../types/job"; // Import the Job type

const JobCard: React.FC<{ job: Job }> = ({ job }) => {
  return (
    <div className="bg-white p-4 rounded shadow-md space-y-2">
      <h3 className="font-semibold">{job.company}</h3>
      <p className="text-gray-500">{job.position}</p>
      <span
        className={`inline-block px-2 py-1 text-white rounded-full ${
          job.status === "Applied"
            ? "bg-blue-500"
            : job.status === "Interviewing"
            ? "bg-yellow-500"
            : job.status === "Offer"
            ? "bg-green-500"
            : "bg-red-500"
        }`}
      >
        {job.status}
      </span>
      {job.notes && <p className="text-gray-700 mt-2">{job.notes}</p>}
    </div>
  );
};

export default JobCard;