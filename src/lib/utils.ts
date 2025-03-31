import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getRandomElement<T>(array: T[]): T | null {
  if (!array || array.length === 0) return null;
  return array[Math.floor(Math.random() * array.length)];
}
