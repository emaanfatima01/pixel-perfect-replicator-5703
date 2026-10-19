import {
  GraduationCap, FileCheck2, KanbanSquare, MessageSquareText, Bell, Upload, Search,
  UserCheck, ClipboardList, Users, Presentation, LineChart, Clock, Megaphone,
} from "lucide-react";

export const steps = [
  { icon: ClipboardList, title: "Proposal Submission", text: "Students write a structured proposal and attach supporting documents." },
  { icon: UserCheck, title: "Supervisor Review", text: "Supervisors approve, reject or request revisions with written notes." },
  { icon: KanbanSquare, title: "Milestones", text: "Approved projects are broken into milestones with start and due dates." },
  { icon: LineChart, title: "Progress Tracking", text: "Progress updates, deliverables and comments are logged as work moves forward." },
  { icon: Presentation, title: "Final Presentation", text: "The coordinator schedules the defense and marks the project completed." },
];

export const features = [
  { icon: FileCheck2, title: "Proposal review", text: "Draft, Submitted, Under Review, Approved, Revision Required or Rejected — every status is visible." },
  { icon: KanbanSquare, title: "Milestone board", text: "Plan analysis to final presentation on a board with clear overdue signals." },
  { icon: MessageSquareText, title: "Feedback history", text: "Every comment, revision request and reply kept alongside the project." },
  { icon: Upload, title: "Document uploads", text: "Attach proposals and milestone deliverables to secure, private storage." },
  { icon: Bell, title: "Deadline reminders", text: "Overdue milestones stand out and upcoming deadlines appear on the dashboard." },
  { icon: Search, title: "Search & filter", text: "Find projects by title, student, supervisor or status in seconds." },
];

export const roles = [
  { icon: GraduationCap, title: "Students", points: ["Submit and revise proposals", "Manage milestones and upload deliverables", "Track progress and deadlines", "Read supervisor feedback"] },
  { icon: Users, title: "Supervisors", points: ["Review assigned proposals", "Update milestone statuses", "Comment on deliverables", "See which students need feedback"] },
  { icon: Megaphone, title: "Coordinators", points: ["Manage users and roles", "Assign supervisors to projects", "Schedule final presentations", "Publish announcements and monitor deadlines"] },
];

export const benefits = [
  { icon: ClipboardList, title: "Organization", text: "Proposals, files, milestones and comments live in one record instead of scattered emails." },
  { icon: MessageSquareText, title: "Communication", text: "A shared feedback thread keeps students and supervisors on the same page." },
  { icon: Clock, title: "Deadline management", text: "Overdue milestones stand out, and reminders appear before due dates." },
];

export const categories = [
  { title: "Web Applications", text: "Management systems, portals and e-commerce platforms built with modern web stacks." },
  { title: "Mobile Applications", text: "Android and cross-platform apps solving campus or community problems." },
  { title: "AI & Machine Learning", text: "Prediction, classification, chatbots and computer vision projects." },
  { title: "Networking & Security", text: "Network monitoring, intrusion detection and secure communication tools." },
  { title: "IoT & Embedded", text: "Sensor-based systems, smart devices and automation projects." },
  { title: "Data Science", text: "Dashboards, analytics and data-driven decision support systems." },
];

export const statuses = [
  { name: "Draft", text: "Saved by the student, not yet sent." },
  { name: "Submitted", text: "Sent to the supervisor for review." },
  { name: "Under Review", text: "The supervisor is reading the proposal." },
  { name: "Revision Required", text: "Changes requested — the student updates and resubmits." },
  { name: "Approved", text: "Work begins on milestones." },
  { name: "Rejected", text: "The idea is not accepted; a new proposal is needed." },
];
