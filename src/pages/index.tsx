import React, { useState, useEffect } from "react";
import JobForm from "../components/JobForm";
import JobCard from "../components/JobCard";
import { db } from "../firebase/config";
import { query, where, getDocs, collection, orderBy, doc } from "firebase/firestore";
import { Job, JobStatus } from "../types/job";
import { useAuth } from "../context/AuthContext";
import { deleteDoc } from "firebase/firestore";
import UpdateModal from "../components/UpdateModal"
import Dashboard from "../components/Dashboard";


export interface User {
  id: string;
  email: string;
  fullName?: string;
}
const HomePage: React.FC = () => {


  const { user, logout } = useAuth(); // Get the user and logout function from AuthContext
  const [jobs, setJobs] = useState<Job[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<JobStatus | "All">("All");
  const [editingJob, setEditingJob] = useState<Job | null>(null); // Track the job being edited
  const [isModalOpen, setIsModalOpen] = useState(false);


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

  const handleEdit = (job: Job) => {
    setEditingJob(job); // Set the job to be edited
    setIsModalOpen(true)
  };


  const handleRemove = async (jobId: string) => {
    try {
      await deleteDoc(doc(db, "jobs", jobId)); // Remove the job from Firestore
      setJobs((prevJobs) => prevJobs.filter((job) => job.id !== jobId)); // Update the local state
    } catch (error) {
      console.error("Error removing job:", error);
    }
  };


  useEffect(() => {
    fetchJobs();
  }, [searchTerm, statusFilter]); // Fetch jobs when search term or status filter changes

  const handleLogout = async () => {
    try {
      await logout(); // Call the logout function from AuthContext
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <header>
        <h1 className="text-3xl font-bold">Job Application Tracker</h1>
        <div>
          <span className="mr-4">Welcome, {user?.fullName || "Guest"}</span>
          <button
            onClick={handleLogout}
            className="p-2 bg-red-500 text-white rounded"
          >
            Logout
          </button>
        </div>
      </header>

      <Dashboard />

      <JobForm onJobAdded={fetchJobs} editingJob={editingJob} setEditingJob={setEditingJob} />

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
        {jobs.length > 0 ? (
          jobs.map((job) => (
            <JobCard key={job.id} job={job} onEdit={handleEdit} onRemove={handleRemove} />
          ))
        ) : (
          <p className="text-center text-gray-500 mt-4">No jobs found. Start by adding a new job!</p>
        )}
      </div>
      <UpdateModal
       isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
           setEditingJob(null)
        }}>
      <h2 className="text-xl font-bold mb-4">Update Job</h2>
      <JobForm
        onJobAdded={async () => {
          await fetchJobs();
          setIsModalOpen(false);
          setEditingJob(null) // Close the modal after updating
        }}
        editingJob={editingJob}
        setEditingJob={setEditingJob}
      />
    </UpdateModal>
    </div >
  );
};

export default HomePage;