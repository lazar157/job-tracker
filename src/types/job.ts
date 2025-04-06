export type JobStatus = "Applied" | "Interviewing" | "Offer" | "Rejected";

export interface Job {
  id?: string;
  company: string;
  position: string;
  status: JobStatus;
  date: string;
  notes?: string;
}