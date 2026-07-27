export const mockEmployees = [
  { id: "1", name: "Alice Smith", email: "alice@acme.com", role: "Product Manager", department: "Product", status: "Present", avatar: "A" },
  { id: "2", name: "Bob Jones", email: "bob@acme.com", role: "Software Engineer", department: "Engineering", status: "Late", avatar: "B" },
  { id: "3", name: "Charlie Brown", email: "charlie@acme.com", role: "UI Designer", department: "Design", status: "Absent", avatar: "C" },
  { id: "4", name: "Diana Prince", email: "diana@acme.com", role: "Marketing Lead", department: "Marketing", status: "Present", avatar: "D" },
  { id: "5", name: "Evan Wright", email: "evan@acme.com", role: "Sales Rep", department: "Sales", status: "On Leave", avatar: "E" },
];

export const mockNotifications = [
  { id: "1", title: "Leave Request Approved", message: "Your leave request for Oct 12 has been approved.", time: "10 min ago", read: false, type: "success" },
  { id: "2", title: "New Team Member", message: "Say hi to Sarah, who joined the Engineering team today.", time: "1 hour ago", read: false, type: "info" },
  { id: "3", title: "System Update", message: "The attendance system will be undergoing maintenance tonight.", time: "5 hours ago", read: true, type: "warning" },
  { id: "4", title: "Check-in Reminder", message: "You forgot to check out yesterday. Please update your timesheet.", time: "1 day ago", read: true, type: "error" },
];

export const mockActivities = [
  { id: "1", user: "Alice Smith", action: "Checked In", time: "09:02 AM", date: "Today", type: "check-in" },
  { id: "2", user: "Bob Jones", action: "Checked In (Late)", time: "09:45 AM", date: "Today", type: "check-in-late" },
  { id: "3", user: "Evan Wright", action: "Leave Approved", time: "08:30 AM", date: "Today", type: "leave" },
  { id: "4", user: "Diana Prince", action: "Checked Out", time: "06:15 PM", date: "Yesterday", type: "check-out" },
];

export const mockStats = {
  totalEmployees: 24,
  presentToday: 18,
  absentToday: 2,
  lateToday: 3,
  onLeave: 1,
  averageWorkingHours: "8h 15m",
};

export const employeeDashboardStats = {
  officeTime: "09:00 AM - 06:00 PM",
  status: "Checked In",
  checkInTime: "08:55 AM",
  checkOutTime: "--:-- --",
  workingHoursToday: "4h 30m",
  totalHoursThisMonth: "124h",
  leavesTaken: 2,
  leavesRemaining: 18,
};

export const mockAttendancePreview = [
  { date: "Oct 24", status: "Present", checkIn: "08:55 AM", checkOut: "06:10 PM", hours: "9h 15m" },
  { date: "Oct 23", status: "Present", checkIn: "09:15 AM", checkOut: "06:00 PM", hours: "8h 45m" },
  { date: "Oct 22", status: "Leave", checkIn: "-", checkOut: "-", hours: "0h 0m" },
  { date: "Oct 21", status: "Present", checkIn: "08:50 AM", checkOut: "06:05 PM", hours: "9h 15m" },
  { date: "Oct 20", status: "Present", checkIn: "09:00 AM", checkOut: "05:30 PM", hours: "8h 30m" },
];
