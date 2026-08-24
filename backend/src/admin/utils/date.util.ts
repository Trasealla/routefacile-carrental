
import * as dayjs from 'dayjs';

/**
 * Morocco timezone offset (UTC+1).
 *
 * This was +04:00 (Dubai) — inherited from the UAE operation. A customer who
 * chose a 10:00 pick-up had it stored as 10:00+04:00, i.e. 07:00 Morocco time,
 * so every booking in the system was recorded three hours earlier than the
 * customer asked for, and the confirmation email quoted that wrong time back.
 *
 * Morocco stays on UTC+1 all year.
 */
export const MOROCCO_TIMEZONE_OFFSET = '+01:00';

/**
 * Creates a Date object from date and time strings, treating them as local
 * Morocco time, so the result does not depend on the server's timezone.
 *
 * @param date - Date string in YYYY-MM-DD format
 * @param time - Time string in HH:MM format
 */
export function createLocalDateTime(date: string, time: string): Date {
  return new Date(`${date}T${time}:00${MOROCCO_TIMEZONE_OFFSET}`);
}

export function getCurrentDateFormatted(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}${month}${day}`;
}

export function getDaysInMonth(month: number, year: number): number {

  return new Date(year, month, 0).getDate();
}

export function createDateString(day: number, month: number, year: number): string {

  const date = new Date(year, month - 1, day + 1);

  const dateString = date.toISOString().split('T')[0];
  return dateString;
}

export function excelDateToString(excel_date: number): string {
  const date = new Date(Math.round((excel_date - 25569) * 864e5));

  const isoDateString = date.toISOString().split('T')[0];

  return isoDateString;
}

export function isWeekday(day: number, month: number, year: number): boolean {
  const date = new Date(year, month - 1, day + 1);

  return (date.getDay() >= 2 && date.getDay() <= 6);
}

export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getDaysBetweenDates(from_date: string, pickup_time: string, to_date: string, dropoff_time: string) {
  const MS_PER_DAY = 86400000; // Number of milliseconds in a day

  // Construct dates without time zone conversions
  const pickupDate = new Date(`${from_date}T${pickup_time}:00Z`);  // Add 'Z' to treat as UTC
  const dropoffDate = new Date(`${to_date}T${dropoff_time}:00Z`);  // Add 'Z' to treat as UTC

  // Calculate the difference in milliseconds
  const diffInMilliseconds = dropoffDate.getTime() - pickupDate.getTime();
  const diffInDays = diffInMilliseconds / MS_PER_DAY;

  // Determine total days, rounding appropriately
  const totalDays = diffInDays <= 1 ? 1 : Math.ceil(diffInDays);

  // Adjust the dropoff date output based on totalDays
  const adjustedDropoffDate = new Date(pickupDate.getTime() + (totalDays - 1) * MS_PER_DAY);
  const formattedDropoffDate = adjustedDropoffDate.toISOString().split('T')[0];

  return {
    total_days: totalDays,
    dropoff_date: formattedDropoffDate,
  };
}

export function getDatesBetween(start_date: string, end_date: string) {
  const dates = [];
  let currentDate = new Date(start_date);

  while (currentDate <= new Date(end_date)) {
    dates.push(currentDate.toISOString().split('T')[0]);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
}

export function getCurrentDate(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}



export function calculateReservation(from_date: string, pickup_time: string, to_date: string, dropoff_time: string) {
  const response = getDaysBetweenDates(from_date, pickup_time, to_date, dropoff_time)

  // Calculate full 30-day months
  const actualMonths = Math.floor(response.total_days / 30);

  // Calculate remaining days (flexi days)
  const flexiDays = response.total_days % 30;

  return {
    booking_days: response.total_days, // Total days of reservation (including end date)
    booking_months: actualMonths, // Full 30-day months
    flexi_days: flexiDays // Remaining days
  };
}

export function monthlyBrackets(months: number) {
  let q_month;
  if (months >= 1 && months < 3) {
    q_month = 1;
  } else if (months > 2 && months < 6) {
    q_month = 3;
  } else if (months >= 6) {
    q_month = 6;
  }

  return q_month;
}