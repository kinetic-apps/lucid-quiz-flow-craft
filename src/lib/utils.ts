import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Parse URL query parameters with type safety
 * @param search The query string to parse (from location.search)
 */
export function parseQueryParams(search: string): Record<string, string> {
  const params = new URLSearchParams(search);
  const result: Record<string, string> = {};
  
  params.forEach((value, key) => {
    result[key] = value;
  });
  
  return result;
}

/**
 * Create a URL with query parameters
 * @param baseUrl Base URL without query parameters
 * @param params Object containing key-value pairs for query parameters
 */
export function createUrlWithParams(baseUrl: string, params: Record<string, string | number | boolean>): string {
  const url = new URL(baseUrl, window.location.origin);
  
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, String(value));
  });
  
  return url.toString();
}
