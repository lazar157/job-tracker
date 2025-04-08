import React, { useState, useEffect } from "react";
import { db } from "../firebase/config";// Adjusted import path
import { collection, addDoc, serverTimestamp, updateDoc, doc } from "firebase/firestore";
import { Job, JobStatus } from "../types/job";
import { toast } from "react-hot-toast";

interface JobFormProps {
  onJobAdded: () => Promise<void>;
  editingJob: Job | null;
  setEditingJob: React.Dispatch<React.SetStateAction<Job | null>>;
}
const JobForm: React.FC<JobFormProps> = ({onJobAdded, editingJob, setEditingJob}) => {
  const [company, setCompany] = useState("");
  const [position, setPosition] = useState("");
  const [status, setStatus] = useState<JobStatus>("Applied");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (editingJob) {
      setCompany(editingJob.company);
      setPosition(editingJob.position);
      setStatus(editingJob.status);
      setNotes(editingJob.notes || "");
    } else {
      // Reset the form when not editing
      setCompany("");
      setPosition("");
      setStatus("Applied");
      setNotes("");
    }
  }, [editingJob]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (company && position) {
      try {
        if (editingJob) {
          // Update the existing job in Firestore
          const jobRef = doc(db, "jobs", editingJob.id);
          await updateDoc(jobRef, {
            company,
            position,
            status,
            notes,
            updatedAt: serverTimestamp(), // Add an updated timestamp
          });
          toast.success("Job application updated!");
        } else {
          // Add a new job to Firestore
          await addDoc(collection(db, "jobs"), {
            company,
            position,
            status,
            notes,
            createdAt: serverTimestamp(), // Add a created timestamp
          });
          toast.success("Job application added!");
        }

        // Reset the form and clear the editing state
        setCompany("");
        setPosition("");
        setStatus("Applied");
        setNotes("");
        setEditingJob(null);
        onJobAdded();
      } catch (error) {
        console.error("Error saving job: ", error);
        toast.error("Failed to save job.");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
        <label htmlFor="company" className="block text-sm font-medium text-gray-700">
          Company Name
        </label>
      <input
        type="text"
        value={company}
        onChange={(e) => setCompany(e.target.value)}
        placeholder="Company Name"
        className="w-full p-2 border rounded"
        required
      />
       <label htmlFor="position" className="block text-sm font-medium text-gray-700">
          Position
        </label>
      <input
        type="text"
        value={position}
        onChange={(e) => setPosition(e.target.value)}
        placeholder="Position"
        className="w-full p-2 border rounded"
        required
      />
        <label htmlFor="status" className="block text-sm font-medium text-gray-700">
        Status
      </label>
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value as JobStatus)}
        className="w-full p-2 border rounded"
      >
        <option value="Applied">Applied</option>
        <option value="Interviewing">Interviewing</option>
        <option value="Offer">Offer</option>
        <option value="Rejected">Rejected</option>
      </select>

      <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
        Notes
      </label>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Notes"
        className="w-full p-2 border rounded resize-none"
      />
      <button type="submit" className="w-full p-2 bg-blue-500 text-white rounded">
        {editingJob ? "Update Job" : "Add Job"}
      </button>
    </form>
  );
};

export default JobForm;