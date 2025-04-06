import React, { useState, useEffect } from "react";
import JobForm from "../components/JobForm";
import JobCard from "../components/JobCard";
import { db } from "../firebase/config";
import { query, where, getDocs, collection, orderBy } from "firebase/firestore";
import { Job, JobStatus } from "../types/job"; // Import the Job and JobStatus types

const HomePage: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<JobStatus | "All">("All");

  const fetchJobs = async () => {
    try {
      let jobsArray: Job[] = [];

      if (searchTerm) {
        const companyQuery = query(
          collection(db, "jobs"),
          where("company", ">=", searchTerm),
          where("company", "<=", searchTerm + "\uf8ff"),
          orderBy("createdAt", "desc")
        );

        const positionQuery = query(
          collection(db, "jobs"),
          where("position", ">=", searchTerm),
          where("position", "<=", searchTerm + "\uf8ff"),
          orderBy("createdAt", "desc")
        );

        const [companySnapshot, positionSnapshot] = await Promise.all([
          getDocs(companyQuery),
          getDocs(positionQuery),
        ]);

        const companyJobs = companySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Record<string, unknown>),
        })) as Job[];

        const positionJobs = positionSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Record<string, unknown>),
        })) as Job[];

        const mergedJobs = [...companyJobs, ...positionJobs];
        const uniqueJobs = Array.from(
          new Map(mergedJobs.map((job) => [job.id, job])).values()
        );

        jobsArray = uniqueJobs;

      } else {
        const allJobsQuery = query(collection(db, "jobs"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(allJobsQuery);
        jobsArray = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Record<string, unknown>),
        })) as Job[];
      }

      if (statusFilter !== "All") {
        jobsArray = jobsArray.filter((job) => job.status === statusFilter);
      }

      setJobs(jobsArray);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    }
  };

  

  useEffect(() => {
    fetchJobs();
  }, [searchTerm, statusFilter]); // Fetch jobs when search term or status filter changes

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <header>
        <h1 className="text-3xl font-bold">Job Application Tracker</h1>
      </header>

      <JobForm onJobAdded={fetchJobs}/>

      {/* Search Bar */}
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search by company or position"
        className="w-full p-2 border rounded mb-4"
      />

      
      {/* Status Filter */}
      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value as JobStatus | "All")}
        className="w-full p-2 border rounded mb-4"
      >
        <option value="All">All</option>
        <option value="Applied">Applied</option>
        <option value="Interviewing">Interviewing</option>
        <option value="Offer">Offer</option>
        <option value="Rejected">Rejected</option>
      </select>

      <div className="space-y-4">
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>
    </div>
  );
};

export default HomePage;