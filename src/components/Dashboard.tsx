import React, { useEffect, useState } from "react";
import { db } from "../firebase/config";
import { collection, query, onSnapshot, orderBy } from "firebase/firestore";
import { Job } from "../types/job";

const Dashboard: React.FC = () => {
  const [applicationsByStatus, setApplicationsByStatus] = useState<Record<string, number>>({});
  const [upcomingInterviews, setUpcomingInterviews] = useState<Job[]>([]);
  const [recentActivities, setRecentActivities] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      query(collection(db, "jobs"), orderBy("createdAt", "desc")),
      (snapshot) => {
        try {
          const jobs = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              createdAt: data.createdAt?.toDate(), // Convert Firestore Timestamp to JavaScript Date
            } as Job;
          });

          // Group by status
          const statusCounts: Record<string, number> = {
            Applied: 0,
            Interviewing: 0,
            Offer: 0,
            Rejected: 0,
          };
          jobs.forEach((job) => {
            if (job.status in statusCounts) {
              statusCounts[job.status]++;
            }
          });
          setApplicationsByStatus(statusCounts);

          // Filter upcoming interviews
          setUpcomingInterviews(jobs.filter((job) => job.status === "Interviewing"));

          // Sort recent activities
          setRecentActivities(jobs.slice(0, 5)); // Limit to 5 recent activities

          setLoading(false);
        } catch (err) {
          console.error("Error processing dashboard data:", err);
          setError("Failed to load dashboard data.");
          setLoading(false);
        }
      },
      (err) => {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <p className="text-center text-gray-500">Loading dashboard...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500">{error}</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      {/* Applications by Status */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-bold mb-4">Applications by Status</h2>
        <ul>
          {Object.entries(applicationsByStatus).map(([status, count]) => (
            <li key={status} className="flex justify-between text-sm">
              <span>{status}</span>
              <span>{count}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Upcoming Interviews */}
      <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-bold mb-4">Upcoming Interviews</h2>
        {upcomingInterviews.length > 0 ? (
          <div className="max-h-40 overflow-y-auto">
            <ul>
              {upcomingInterviews.map((job) => (
                <li key={job.id} className="text-sm mb-2">
                  <span className="font-medium">{job.position}</span> at {job.company}
                  <br />
                  <span className="text-xs">
                    Applied on: {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : "N/A"}
                  </span>
                  {job.notes && <p className="text-xs mt-1">Notes: {job.notes}</p>}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-sm">No upcoming interviews.</p>
        )}
      </div>

      {/* Recent Activities */}
      <div className="bg-gradient-to-r from-gray-500 to-gray-600 text-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-bold mb-4">Recent Activities</h2>
        {recentActivities.length > 0 ? (
          <div className="max-h-40 overflow-y-auto">
            <ul>
              {recentActivities.map((job) => (
                <li key={job.id} className="text-sm mb-2">
                  <span className="font-medium">{job.position}</span> at {job.company} ({job.status})
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-sm">No recent activities.</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;