'use client';

import * as React from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
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
  const [open, setOpen] = React.useState(false);

  const selectedLabel = React.useMemo(() => {
    if (!repo) return 'Search repository...';
    const selectedOption = repoOptions.find(option => option.value === repo);
    return selectedOption ? selectedOption.label : repo;
  }, [repo, repoOptions]);

  return (
    <div className="flex-1 min-w-[200px]">
      <label className="block text-sm font-medium mb-2">Repository</label>
      <div className="relative">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between"
              disabled={isLoading}
            >
              <span className="truncate">{selectedLabel}</span>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0">
            <Command>
              <CommandInput
                placeholder="Search repository..."
                className="h-9"
              />
              <CommandList>
                <CommandEmpty>
                  {isLoading ? 'Loading...' : 'No repositories found.'}
                </CommandEmpty>
                <CommandGroup>
                  {repoOptions.map(option => (
                    <CommandItem
                      key={option.value}
                      value={option.value}
                      onSelect={currentValue => {
                        setRepo(currentValue === repo ? '' : currentValue);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          repo === option.value ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                      <span className="truncate">{option.label}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        {isLoading && (
          <div className="absolute right-8 top-2.5 text-gray-400">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RepoSearch;
