import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const repoStrToList = (repoStr: string): string[] => {
  return repoStr
    .split(',')
    .map(name => {
      // auto remove github prefix
      const trimmedName = name.trim();
      if (trimmedName.startsWith('https://github.com/')) {
        return trimmedName.substring('https://github.com/'.length);
      }

      // remove gitee prefix
      if (trimmedName.startsWith('https://gitee.com/')) {
        return trimmedName.substring('https://gitee.com/'.length);
      }

      return trimmedName;
    })
    .filter(name => name.length > 0);
};
