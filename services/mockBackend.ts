import { AttendanceRecord, AttendanceStatus, User, UserRole } from '../types';

// Initial Mock Data
const INITIAL_USERS: User[] = [
  {
    id: 'u1',
    name: 'Admin User',
    email: 'admin@faceauth.com',
    role: UserRole.ADMIN,
    avatarUrl: 'https://picsum.photos/id/1/200/200'
  },
  {
    id: 'u2',
    name: 'John Doe',
    email: 'john@student.com',
    role: UserRole.STUDENT,
    studentId: 'ST-2024-001',
    department: 'Computer Science',
    avatarUrl: 'https://picsum.photos/id/1005/200/200'
  },
  {
    id: 'u3',
    name: 'Jane Smith',
    email: 'jane@student.com',
    role: UserRole.STUDENT,
    studentId: 'ST-2024-002',
    department: 'Engineering',
    avatarUrl: 'https://picsum.photos/id/1011/200/200'
  }
];

const ATTENDANCE_STORAGE_KEY = 'faceauth_attendance_db_v1';
const USERS_STORAGE_KEY = 'faceauth_users_db_v1';

// Track the last created user to simulate "recognition" of the person currently testing the app
let lastCreatedUserId: string | null = null;

// --- User Management ---
const loadUsers = (): User[] => {
  try {
    const saved = localStorage.getItem(USERS_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.warn("Failed to load users from local storage", e);
  }
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(INITIAL_USERS));
  return INITIAL_USERS;
};

let usersDb: User[] = loadUsers();

const saveUsers = () => {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(usersDb));
};

// --- Attendance Management ---

// Helper to generate random recent attendance
const generateMockAttendance = (): AttendanceRecord[] => {
  const records: AttendanceRecord[] = [];
  const now = new Date();
  
  // Generate for last 5 days
  for (let i = 0; i < 5; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    usersDb.filter(u => u.role === UserRole.STUDENT).forEach(user => {
      // Randomly assign status
      const rand = Math.random();
      let status = AttendanceStatus.PRESENT;
      if (rand > 0.9) status = AttendanceStatus.ABSENT;
      else if (rand > 0.8) status = AttendanceStatus.LATE;

      if (status !== AttendanceStatus.ABSENT) {
        records.push({
          id: `att-${dateStr}-${user.id}`,
          userId: user.id,
          userName: user.name,
          date: dateStr,
          checkInTime: new Date(date.setHours(9, Math.floor(Math.random() * 30))).toISOString(),
          status: status,
          confidenceScore: 0.98
        });
      } else {
         // Absent record
         records.push({
          id: `att-${dateStr}-${user.id}`,
          userId: user.id,
          userName: user.name,
          date: dateStr,
          checkInTime: '-',
          status: AttendanceStatus.ABSENT,
          confidenceScore: 0
        });
      }
    });
  }
  return records;
};

const loadAttendance = (): AttendanceRecord[] => {
  try {
    const saved = localStorage.getItem(ATTENDANCE_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.warn("Failed to load attendance from local storage", e);
  }
  
  const initial = generateMockAttendance();
  localStorage.setItem(ATTENDANCE_STORAGE_KEY, JSON.stringify(initial));
  return initial;
};

let attendanceDb: AttendanceRecord[] = loadAttendance();

const saveAttendance = () => {
  localStorage.setItem(ATTENDANCE_STORAGE_KEY, JSON.stringify(attendanceDb));
};

// --- API SIMULATION ---

export const api = {
  login: async (email: string): Promise<User> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Find user by email only
        const user = usersDb.find(u => u.email === email);
        if (user) resolve(user);
        else reject(new Error('Invalid credentials'));
      }, 800);
    });
  },

  register: async (data: { name: string; email: string; role: UserRole; secretCode?: string }): Promise<User> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Validate Email
        if (usersDb.find(u => u.email === data.email)) {
          reject(new Error('Email already exists'));
          return;
        }

        // Validate Admin Code
        if (data.role === UserRole.ADMIN && data.secretCode !== 'Vsvg@admin') {
          reject(new Error('Invalid Admin Secret Code'));
          return;
        }

        const newUser: User = {
          id: `u${Date.now()}`,
          name: data.name,
          email: data.email,
          role: data.role,
          avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}&background=random`,
          studentId: data.role === UserRole.STUDENT ? `ST-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)}` : undefined,
          department: data.role === UserRole.STUDENT ? 'General' : undefined
        };

        usersDb = [...usersDb, newUser];
        lastCreatedUserId = newUser.id;
        saveUsers();
        resolve(newUser);
      }, 1000);
    });
  },

  // New method for Admin to add students
  addStudent: async (data: { name: string; email: string; studentId: string; department: string; faceImage: string }): Promise<User> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
         if (usersDb.find(u => u.email === data.email)) {
          reject(new Error('Email already exists'));
          return;
        }
        if (usersDb.find(u => u.studentId === data.studentId)) {
          reject(new Error('Student ID already exists'));
          return;
        }

        const newUser: User = {
            id: `u${Date.now()}`,
            name: data.name,
            email: data.email,
            role: UserRole.STUDENT,
            studentId: data.studentId,
            department: data.department,
            avatarUrl: data.faceImage
        };

        usersDb = [...usersDb, newUser];
        lastCreatedUserId = newUser.id; // Track this user for demo purposes
        saveUsers();
        resolve(newUser);
      }, 1500);
    });
  },

  verifyFace: async (imageSrc: string): Promise<{ matched: boolean; user?: User; score: number }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const randomScore = 0.85 + (Math.random() * 0.14); // 0.85 - 0.99
        resolve({
          matched: true,
          score: randomScore
        });
      }, 2000); 
    });
  },

  // Simulates scanning a face and finding the user from the database
  identifyAndMarkAttendance: async (imageSrc: string): Promise<{ record: AttendanceRecord, user: User }> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const students = usersDb.filter(u => u.role === UserRole.STUDENT);
            if (students.length === 0) {
                reject(new Error("No registered students found."));
                return;
            }

            // SIMULATION LOGIC:
            // If we have a recently created user (demo session), prioritize identifying them.
            // Otherwise, pick a random student.
            let matchedUser: User | undefined;
            
            if (lastCreatedUserId) {
                matchedUser = students.find(u => u.id === lastCreatedUserId);
                // 30% chance to pick someone else to show robustness, or if user not found
                if (Math.random() > 0.7) matchedUser = undefined;
            }

            if (!matchedUser) {
                matchedUser = students[Math.floor(Math.random() * students.length)];
            }

            // Mark attendance for this identified user
            const now = new Date();
            const newRecord: AttendanceRecord = {
              id: `att-${Date.now()}`,
              userId: matchedUser.id,
              userName: matchedUser.name,
              date: now.toISOString().split('T')[0],
              checkInTime: now.toISOString(),
              status: now.getHours() > 9 ? AttendanceStatus.LATE : AttendanceStatus.PRESENT,
              confidenceScore: 0.88 + (Math.random() * 0.1)
            };

            attendanceDb = [newRecord, ...attendanceDb];
            saveAttendance();

            resolve({ record: newRecord, user: matchedUser });
        }, 1800);
    });
  },

  markAttendance: async (userId: string, imageSrc: string): Promise<AttendanceRecord> => {
    const verification = await api.verifyFace(imageSrc);
    
    if (!verification.matched) {
      throw new Error("Face not recognized");
    }

    const user = usersDb.find(u => u.id === userId);
    if (!user) throw new Error("User not found");

    const now = new Date();
    const newRecord: AttendanceRecord = {
      id: `att-${Date.now()}`,
      userId: user.id,
      userName: user.name,
      date: now.toISOString().split('T')[0],
      checkInTime: now.toISOString(),
      status: now.getHours() > 9 ? AttendanceStatus.LATE : AttendanceStatus.PRESENT,
      confidenceScore: verification.score
    };

    attendanceDb = [newRecord, ...attendanceDb];
    saveAttendance();
    
    return newRecord;
  },

  getStudentAttendance: async (userId: string): Promise<AttendanceRecord[]> => {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(attendanceDb.filter(r => r.userId === userId));
      }, 500);
    });
  },

  getAllAttendance: async (): Promise<AttendanceRecord[]> => {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(attendanceDb);
      }, 500);
    });
  },

  getAllStudents: async (): Promise<User[]> => {
     return new Promise(resolve => {
        setTimeout(() => {
            resolve(usersDb.filter(u => u.role === UserRole.STUDENT));
        }, 500);
     });
  }
};