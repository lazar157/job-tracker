import React, { useState } from "react";
import { db } from "../firebase/config";// Adjusted import path
import { collection, addDoc } from "firebase/firestore";
import { JobStatus } from "../types/job";

const JobForm: React.FC = () => {
  const [company, setCompany] = useState("");
  const [position, setPosition] = useState("");
  const [status, setStatus] = useState<JobStatus>("Applied");
  const [notes, setNotes] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (company && position) {
      try {
        await addDoc(collection(db, "jobs"), {
          company,
          position,
          status,
          notes,
          date: new Date().toISOString(),
        });
        setCompany("");
        setPosition("");
        setStatus("Applied");
        setNotes("");
        alert("Job application added!");
      } catch (error) {
        console.error("Error adding job: ", error);
        alert("Failed to add job.");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        value={company}
        onChange={(e) => setCompany(e.target.value)}
        placeholder="Company Name"
        className="w-full p-2 border rounded"
        required
      />
      <input
        type="text"
        value={position}
        onChange={(e) => setPosition(e.target.value)}
        placeholder="Position"
        className="w-full p-2 border rounded"
        required
      />
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
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Notes"
        className="w-full p-2 border rounded resize-none"
      />
      <button type="submit" className="w-full p-2 bg-blue-500 text-white rounded">
        Add Job
      </button>
    </form>
  );
};

export default JobForm;