import React from 'react';
import useRepoMetrics from '../hooks/use-repo-metrics';
import SharedChartRenderer from './shared-chart-renderer';
import { RepoMetricsProps } from '../types/metric';

/**
 * RepoMetrics component displays multiple metrics for a single repository
 * Uses a custom hook for data fetching and a shared component for rendering
 */
export default function RepoMetrics({
  repo,
  metrics,
  platform = 'github',
  figType = 'line',
  width = '100%',
  height = 400,
  showGrid = true,
  showLegend = true,
  showTooltip = true,
  showXAxis = true,
  showYAxis = true,
}: RepoMetricsProps) {
  const { chartData, loading, error } = useRepoMetrics(repo, metrics, platform);

  // Show loading state
  if (loading) {
    return <div>Loading...</div>;
  }

  // Show error state
  if (error) {
    return <div>Error: {error}</div>;
  }

  // Render the chart using the shared component
  return (
    <SharedChartRenderer
      chartData={chartData}
      keys={metrics}
      figType={figType}
      showGrid={showGrid}
      showLegend={showLegend}
      showTooltip={showTooltip}
      showXAxis={showXAxis}
      showYAxis={showYAxis}
      width={width}
      height={height}
    />
  );
}
