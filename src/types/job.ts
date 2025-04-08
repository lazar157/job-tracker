export type JobStatus = "Applied" | "Interviewing" | "Offer" | "Rejected";

export interface Job {
    id: string;
    company: string;
    position: string;
    status: JobStatus;
    notes?: string; 
    createdAt?:string;
    interviewDate?: string; // Optional field for interview date
  

}