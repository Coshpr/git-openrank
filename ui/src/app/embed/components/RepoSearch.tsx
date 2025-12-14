'use client';

import * as React from 'react';
import { Check, ChevronsUpDown, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface RepoSearchProps {
  repo: string;
  setRepo: (value: string) => void;
  repoOptions: { value: string; label: string }[];
  isLoading: boolean;
}

const RepoSearch: React.FC<RepoSearchProps> = ({
  repo,
  setRepo,
  repoOptions,
  isLoading,
}) => {
  return (
    <div className="flex-1 min-w-[200px]">
      <label className="block text-sm font-medium mb-2">Repository</label>

      {/* input */}

      {isLoading && (
        <div className="absolute right-8 top-2.5 text-gray-400">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent"></div>
        </div>
      )}
    </div>
  );
};

export default RepoSearch;
