'use client';

import React from 'react';
import { Combobox } from '@/components/ui/combobox';

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
  isLoading 
}) => {
  return (
    <div className="flex-1 min-w-[200px]">
      <label className="block text-sm font-medium mb-2">Repository</label>
      <div className="relative">
        <Combobox
          placeholder="Search repository..."
          searchPlaceholder="Search repository..."
          emptyText="No repositories found."
          options={repoOptions}
          value={repo}
          onValueChange={setRepo}
          disabled={isLoading}
        />
        {isLoading && (
          <div className="absolute right-3 top-2.5 text-gray-400">
            Loading...
          </div>
        )}
      </div>
    </div>
  );
};

export default RepoSearch;