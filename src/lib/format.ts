const JAKARTA = "Asia/Jakarta";

export function formatDate(value: string | Date | null | undefined) {
  if (!value) return "-";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function formatDateShort(value: string | Date | null | undefined) {
  if (!value) return "-";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatDateTime(value: string | Date | null | undefined) {
  if (!value) return "-";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: JAKARTA,
  }).format(date);
}

export function formatToday() {
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: JAKARTA,
  }).format(new Date());
}

/** yyyy-mm-dd sesuai zona waktu Indonesia, untuk <input type="date"> */
export function toDateInputValue(value: Date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: JAKARTA,
  }).format(value);
  return parts;
}

export function monthLabel(value: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    month: "short",
    timeZone: JAKARTA,
  }).format(value);
}

export function romanMonth(value: Date) {
  const bulan = [
    "I", "II", "III", "IV", "V", "VI",
    "VII", "VIII", "IX", "X", "XI", "XII",
  ];
  const index = Number(
    new Intl.DateTimeFormat("en-CA", { month: "numeric", timeZone: JAKARTA }).format(value),
  );
  return bulan[index - 1] ?? "I";
}

export function yearOf(value: Date = new Date()) {
  return Number(
    new Intl.DateTimeFormat("en-CA", { year: "numeric", timeZone: JAKARTA }).format(value),
  );
}

export function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "??";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function daysUntil(value: string | Date | null | undefined) {
  if (!value) return null;
  const target = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(target.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}

export function truncate(value: string, max = 60) {
  if (value.length <= max) return value;
  return `${value.slice(0, max - 1)}…`;
}
