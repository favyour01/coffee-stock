import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("id-ID").format(value);
}

/** Draft nilai angka di form — string kosong saat user menghapus input */
export type NumericDraft = number | "";

/** Konversi string input number → draft ("" jika dikosongkan) */
export function toNumericDraft(raw: string): NumericDraft {
  if (raw.trim() === "") return "";
  const n = Number(raw);
  return Number.isFinite(n) ? n : "";
}

/** Nilai tampilan controlled input number */
export function numericDraftValue(value: NumericDraft): number | "" {
  return value === "" ? "" : value;
}
