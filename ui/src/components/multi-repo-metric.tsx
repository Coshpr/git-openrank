import useMultiRepoMetrics from '../hooks/use-multi-repo-metrics';
import SharedChartRenderer from './shared-chart-renderer';
import { MultiRepoMetricsProps } from '../types/metric';

/**
 * MultiRepoMetrics component displays metrics for multiple repositories
 * Uses a custom hook for data fetching and a shared component for rendering
 */
export default function MultiRepoMetrics({
  repos,
  metric,
  platform = 'github',
  figType = 'line',
  width = '100%',
  height = 400,
  showGrid = true,
  showLegend = true,
  showTooltip = true,
  showXAxis = true,
  showYAxis = true,
}: MultiRepoMetricsProps) {
  const { chartData, loading, error } = useMultiRepoMetrics(
    repos,
    metric,
    platform
  );

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
      keys={repos}
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
