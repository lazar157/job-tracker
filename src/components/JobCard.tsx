import React from "react";
import { Job } from "../types/job"; // Import the Job type

interface JobCardProps {
  job: Job;
  onEdit: (job: Job) => void;
  onRemove: (jobId: string) => void;
}

const JobCard: React.FC<JobCardProps> = ({ job, onEdit, onRemove}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-300">
    {/* Header Section */}
    <div className="flex justify-between items-center">
      <h3 className="text-lg font-semibold text-gray-800">{job.company}</h3>
      <span
        className={`inline-block px-3 py-1 text-sm font-medium text-white rounded-full ${
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
    </div>

    {/* Position */}
    <p className="text-gray-600 mt-2 text-sm">{job.position}</p>

    {/* Notes */}
    {job.notes && (
      <p className="text-gray-700 mt-4 text-sm border-t pt-2 border-gray-200">
        {job.notes}
      </p>
    )}

    {/* Action Buttons */}
    <div className="flex justify-end space-x-4 mt-4">
      <button
        onClick={() => onEdit(job)}
        className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded hover:bg-blue-600 transition-colors duration-200"
      >
        Edit
      </button>
      <button
        onClick={() => onRemove(job.id)}
        className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded hover:bg-red-600 transition-colors duration-200"
      >
        Remove
      </button>
    </div>
  </div>
  );
};

export default JobCard;