import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { base_url } from '@/lib/constants';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function repoStrToList(str: string): string[] {
  return str
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);
}

export async function fetchRepoMetric(
  repo: string,
  metric: string,
  platform: string
): Promise<Record<string, number>> {
  // Construct the API URL
  const url = `${base_url}${platform}/${repo}/${metric}.json`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch data: ${response.status} ${response.statusText}`
      );
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching data for ${repo} ${metric}:`, error);
    throw error;
  }
}
