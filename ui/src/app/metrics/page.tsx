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
    <div className="container mx-auto py-8 max-w-6xl">
      <Card className="mb-8">
        <CardContent>
          <div className="flex flex-col gap-4 text-sm ">
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
          </div>
        </CardContent>
      </Card>

      {repos && platform && metric && (
        <Card>
          <CardHeader>
            <CardTitle>
              <div className="flex items-center gap-2">
                <div className="px-2 py-1 rounded-full text-sm border w-fit">
                  {METRICS.find(m => m.value === metric)?.label || metric}{' '}
                </div>
                <div>Trend Comparison</div>
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
      <SearchContent />
    </Suspense>
  );
}
