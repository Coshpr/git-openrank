'use client';

import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { METRICS, PLATFORMS } from '@/lib/constants';

interface ParameterSelectorProps {
  platform: string;
  metric: string;
  setPlatform: (value: string) => void;

  setMetric: (value: string) => void;
}

const ParameterSelector: React.FC<ParameterSelectorProps> = ({
  platform,
  metric,
  setPlatform,
  setMetric,
}) => {
  return (
    <>
      <div className="">
        <label className="block text-sm font-medium mb-2">Platform</label>
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

      <div className="">
        <label className="block text-sm font-medium mb-2">Metric</label>
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
    </>
  );
};

export default ParameterSelector;
