'use client';

import { Suspense } from 'react';
import { useQueryState, parseAsString } from 'nuqs';

import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import MultiRepoMetrics from '@/components/multi-repo-metric';
import { METRICS, PLATFORMS } from '../../lib/constants';
import { repoStrToList } from '@/lib/utils';
import { CircleX } from 'lucide-react';

function SearchContent() {
  const [platform, setPlatform] = useQueryState(
    'platform',
    parseAsString.withDefault('github')
  );
  const [repos, setRepos] = useQueryState(
    'repos',
    parseAsString.withDefault(
      'facebook/react, vuejs/vue, angular/angular,vercel/next.js'
    )
  );
  const [metric, setMetric] = useQueryState(
    'metric',
    parseAsString.withDefault('openrank')
  );

  return (
    <div className="container mx-auto py-8 max-w-6xl ">
      <div className="flex flex-col gap-4 text-sm mb-8">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex items-center flex-1">
            <label className="block text-sm font-medium mb-2">
              Repo Names (comma separated)
            </label>
            <Input
              value={repos}
              onChange={e => setRepos(e.target.value)}
              placeholder="e.g., facebook/react, vuejs/vue, angular/angular"
            />
          </div>

          <div className="flex items-center gap-2 ">
            <label className="block font-medium">Platform</label>
            <Select value={platform} onValueChange={setPlatform}>
              <SelectTrigger>
                <SelectValue placeholder="Select platform" />
              </SelectTrigger>
              <SelectContent>
                {PLATFORMS.map(p => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2 ">
            <label className="block font-medium">Metric</label>
            <Select value={metric} onValueChange={setMetric}>
              <SelectTrigger>
                <SelectValue placeholder="Select metric" />
              </SelectTrigger>
              <SelectContent>
                {METRICS.map(m => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-center items-center gap-2">
          {repoStrToList(repos).length > 1 &&
            repoStrToList(repos).map(repo => (
              <div className="flex items-center gap-2 " key={repo}>
                <div
                  className="px-2 py-1 rounded-full text-sm border w-fit 
                                  flex items-center gap-1"
                >
                  {repo}
                  {/* remove button to delete select repo, alt repos str */}
                  <div
                    className="text-xs "
                    onClick={() => {
                      const newRepos = repoStrToList(repos)
                        .filter(r => r !== repo)
                        .join(', ');
                      setRepos(newRepos);
                    }}
                  >
                    <CircleX className="h-4 w-4 hover:text-red-500" />
                  </div>
                  <div></div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {repos && platform && metric && (
        <Card>
          <CardHeader>
            <CardTitle>
              <div className="flex items-center gap-2">
                <div className="px-2 py-1 rounded-full text-sm border w-fit">
                  {METRICS.find(m => m.value === metric)?.label || metric}{' '}
                </div>
                <div> Metric</div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <MultiRepoMetrics
              repos={repoStrToList(repos)}
              metric={metric}
              platform={platform}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="bg-zinc-50 dark:bg-black">
        <SearchContent />
      </div>
    </Suspense>
  );
}
