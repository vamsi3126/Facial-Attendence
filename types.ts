export enum UserRole {
  ADMIN = 'ADMIN',
  STUDENT = 'STUDENT'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  department?: string;
  studentId?: string;
}

export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  LATE = 'LATE',
  HOLIDAY = 'HOLIDAY'
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  userName: string;
  date: string; // ISO Date YYYY-MM-DD
  checkInTime: string; // ISO Timestamp
  status: AttendanceStatus;
  confidenceScore: number; // Simulated matching score
}

export interface DashboardStats {
  totalStudents: number;
  presentToday: number;
  lateToday: number;
  absentToday: number;
  attendanceRate: number;
}
