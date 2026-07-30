

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
  lateThresholdMinutes: number,
  timezone: string
): string {
  // Convert check-in time to local HH:mm string in the given timezone
  const checkInTimeString = checkInTime.toLocaleTimeString('en-US', { 
    hour12: false, 
    timeZone: timezone, 
    hour: '2-digit', 
    minute: '2-digit' 
  });
  
  // Convert strings to minutes since midnight for easy comparison
  const checkInMinutes = timeStringToMinutes(checkInTimeString);
  const startMinutes = timeStringToMinutes(officeStartTimeStr);
  const thresholdMinutes = startMinutes + lateThresholdMinutes;
  
  // Also handle cases where a user might check in before midnight (next day shift) but assuming normal day shifts:
  if (checkInMinutes > thresholdMinutes) {
    return "LATE";
  }
  
  return "PRESENT";
}
