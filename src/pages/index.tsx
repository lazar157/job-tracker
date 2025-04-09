import React, { useState, useEffect } from "react";
import JobForm from "../components/JobForm";
import JobCard from "../components/JobCard";
import { db } from "../firebase/config";
import { query, where, getDocs, collection, orderBy, doc } from "firebase/firestore";
import { Job, JobStatus } from "../types/job";
import { useAuth } from "../context/AuthContext";
import { deleteDoc } from "firebase/firestore";
import UpdateModal from "../components/UpdateModal"
import Modal from "react-modal";
import { UserCircleIcon } from "@heroicons/react/solid"; // Import Heroicons for the profile icon

import Dashboard from "../components/Dashboard";

Modal.setAppElement("#root"); // Set the app element for accessibility



export interface User {
  id: string;
  email: string;
  fullName?: string;
  dateOfBirth?: string; // Ensure this property is defined

}
const HomePage: React.FC = () => {


  const { user, logout } = useAuth(); // Get the user and logout function from AuthContext
  const [jobs, setJobs] = useState<Job[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<JobStatus | "All">("All");
  const [editingJob, setEditingJob] = useState<Job | null>(null); // Track the job being edited
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false); // State to toggle profile dropdown



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

  const customStyles = {
    content: {
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      marginRight: "-50%",
      transform: "translate(-50%, -50%)",
      width: "80%",
      maxWidth: "600px",
      padding: "20px",
      borderRadius: "10px",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    },
    overlay: {
      backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Header */}
      <header className="flex justify-between items-center bg-blue-500 text-white p-4 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold">Job Application Tracker</h1>
        <div className="flex items-center space-x-4">
          <span className="text-sm">Welcome, {user?.fullName || "Guest"}</span>
          <button
            onClick={() => setIsProfileOpen(true)} // Open profile modal
           
          >
            <UserCircleIcon className="w-8 h-8 text-gray-900" /> {/* Profile Icon */}
          </button>
          <div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition duration-200"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Profile Modal */}
      <Modal
        isOpen={isProfileOpen}
        onRequestClose={() => setIsProfileOpen(false)} // Close modal
        style={{
          overlay: {
            backgroundColor: "rgba(0, 0, 0, 0.7)", // Darker overlay for better focus
          },
          content: {
            inset: "50% auto auto 50%",
            transform: "translate(-50%, -50%)",
            padding: "0",
            border: "none",
            borderRadius: "12px",
            maxWidth: "500px",
            width: "90%",
            boxShadow: "0 4px 10px rgba(0, 0, 0, 0.3)",
          },
        }}
      >
        <div className="bg-white rounded-lg overflow-hidden">
          {/* Modal Header */}
          <div className="bg-blue-500 text-white p-4 flex justify-between items-center">
            <h2 className="text-xl font-bold">Profile Details</h2>
            <button
              onClick={() => setIsProfileOpen(false)}
              className="text-white hover:text-gray-200 transition"
            >
              ✕
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-6 space-y-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-24 h-24 rounded-full border-2 border-gray-300 flex items-center justify-center bg-gray-200">
                <UserCircleIcon className="w-16 h-16 text-gray-500" /> {/* Profile Icon */}
              </div>
              <div className="text-center">
                <h3 className="text-lg font-bold">{user?.fullName || "N/A"}</h3>
                <p className="text-sm text-gray-500">{user?.email || "N/A"}</p>
              </div>
            </div>
            <hr className="border-gray-300" />
            <div className="space-y-2">
              <p>
                <strong>Full Name:</strong> {user?.fullName || "N/A"}
              </p>
              <p>
                <strong>Username:</strong> {user?.username || "N/A"}
              </p>
              <p>
                <strong>Date of Birth:</strong> {user?.dateOfBirth || "N/A"}
              </p>
              <p>
                <strong>Phone Number:</strong> {user?.phoneNumber || "N/A"}
              </p>
              <p>
                <strong>Address:</strong> {user?.address || "N/A"}
              </p>
              <p>
                <strong>Account Created:</strong> {user?.createdAt || "N/A"}
              </p>
            </div>
          </div>

          {/* Modal Footer */}

        </div>

      </Modal>


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