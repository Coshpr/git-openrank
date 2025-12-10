/**
 * Common types used across metrics components
 */

export interface MetricData {
  [key: string]: number | string;
}

export interface ChartDataPoint {
  date: string;
  [key: string]: number | string;
}

export interface ProjectData {
  name: string;
  rawData: MetricData;
  chartData: ChartDataPoint[];
}

export interface SharedChartRendererProps {
  chartData: ChartDataPoint[];
  keys: string[];
  figType?: 'line' | 'bar' | 'area';
  showGrid?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
  showXAxis?: boolean;
  showYAxis?: boolean;
  height?: number;
  width?: number | `${number}%` | undefined;
}

export interface MultiRepoMetricsProps {
  repos: string[];
  metric: string;
  platform: string;
  height?: number;
  width?: number | `${number}%` | undefined;
  showGrid?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
  showXAxis?: boolean;
  showYAxis?: boolean;
  figType?: 'line' | 'bar' | 'area';
}

export interface RepoMetricsProps {
  repo: string;
  metrics: string[];
  platform: string;
  height?: number;
  width?: number | `${number}%` | undefined;
  showGrid?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
  showXAxis?: boolean;
  showYAxis?: boolean;
  figType?: 'line' | 'bar' | 'area';
}

export interface UseMultiRepoMetricsResult {
  chartData: ChartDataPoint[];
  loading: boolean;
  error: string | null;
}

export interface UseRepoMetricsResult {
  chartData: ChartDataPoint[];
  loading: boolean;
  error: string | null;
}
