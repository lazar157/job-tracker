import React, { useState, useEffect } from "react";
import JobForm from "../components/JobForm";
import JobCard from "../components/JobCard";
import { db } from "../firebase/config";
import { collection, getDocs } from "firebase/firestore";
import { Job } from "../types/job"; // Import the Job type

const HomePage: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);

  useEffect(() => {
    const fetchJobs = async () => {
      const querySnapshot = await getDocs(collection(db, "jobs"));
      const jobsArray: Job[] = [];
      querySnapshot.forEach((doc) => {
        jobsArray.push({ id: doc.id, ...doc.data() } as Job);
      });
      setJobs(jobsArray);
    };
    fetchJobs();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <header>
        <h1 className="text-3xl font-bold">Job Application Tracker</h1>
      </header>

      <JobForm />

      <div className="space-y-4">
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>
    </div>
  );
};

export default HomePage;