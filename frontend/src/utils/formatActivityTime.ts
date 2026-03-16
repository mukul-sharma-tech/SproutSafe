import { format, formatDistanceToNow, isToday, isYesterday } from "date-fns";

/**
 * Format an activity timestamp for display in the user's local timezone.
 * - Recent (< 1 hour): "5 min ago"
 * - Today: "3:45 PM"
 * - Yesterday: "Yesterday, 3:45 PM"
 * - Older: "Mar 14, 3:45 PM"
 */
export function formatActivityTime(isoOrDate: string | Date | undefined | null): string {
  if (!isoOrDate) return "";
  const date = typeof isoOrDate === "string" ? new Date(isoOrDate) : isoOrDate;
  if (Number.isNaN(date.getTime())) return "";

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  if (diffMs >= 0 && diffMs < 60 * 60 * 1000) {
    return formatDistanceToNow(date, { addSuffix: true });
  }
  if (isToday(date)) {
    return format(date, "h:mm a");
  }
  if (isYesterday(date)) {
    return `Yesterday, ${format(date, "h:mm a")}`;
  }
  return format(date, "MMM d, h:mm a");
}

/**
 * Format for activity table: time only when today, otherwise date + time.
 */
export function formatActivityTableTime(isoOrDate: string | Date | undefined | null): string {
  if (!isoOrDate) return "—";
  const date = typeof isoOrDate === "string" ? new Date(isoOrDate) : isoOrDate;
  if (Number.isNaN(date.getTime())) return "—";

  if (isToday(date)) {
    return format(date, "h:mm a");
  }
  if (isYesterday(date)) {
    return `Yesterday, ${format(date, "h:mm a")}`;
  }
  return format(date, "MMM d, h:mm a");
}
