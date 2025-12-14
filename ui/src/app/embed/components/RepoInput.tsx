'use client';

import { Input } from '@/components/ui/input';
import * as React from 'react';

interface RepoInputProps {
  repo: string;
  setRepo: (value: string) => void;
  repoOptions: { value: string; label: string }[];
  isLoading: boolean;
}

const RepoInput: React.FC<RepoInputProps> = ({ repo, setRepo, isLoading }) => {
  return (
    <div className="flex-1 min-w-[200px]">
      <label className="block text-sm font-medium mb-2">Repository</label>

      {/* input */}
      <Input
        value={repo}
        onChange={e => setRepo(e.target.value)}
        placeholder="input repo name"
      />

      {isLoading && (
        <div className="absolute right-8 top-2.5 text-gray-400">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent"></div>
        </div>
      )}
    </div>
  );
};

export default RepoInput;
