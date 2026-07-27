

/**
 * Parses a HH:mm string into minutes since midnight.
 */
export function timeStringToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return (hours * 60) + (minutes || 0);
}

/**
 * Calculates working minutes between check-in and check-out
 */
export function calculateWorkingMinutes(checkIn: Date, checkOut: Date): number {
  const diffMs = checkOut.getTime() - checkIn.getTime();
  return Math.max(0, Math.floor(diffMs / 60000));
}

/**
 * Formats minutes into a readable string "Xh Ym"
 */
export function formatMinutes(totalMinutes: number): string {
  if (!totalMinutes || totalMinutes < 0) return "0h 0m";
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m`;
}

/**
 * Determines attendance status based on check-in time and office settings
 */
export function determineAttendanceStatus(
  checkInTime: Date,
  officeStartTimeStr: string,
  lateThresholdMinutes: number
): string {
  // Convert office start time to today's date for comparison
  const [startHour, startMinute] = officeStartTimeStr.split(':').map(Number);
  
  const expectedStartTime = new Date(checkInTime);
  expectedStartTime.setHours(startHour, startMinute, 0, 0);
  
  const lateThresholdTime = new Date(expectedStartTime.getTime() + lateThresholdMinutes * 60000);

  if (checkInTime > lateThresholdTime) {
    return "LATE";
  }
  
  return "PRESENT";
}
