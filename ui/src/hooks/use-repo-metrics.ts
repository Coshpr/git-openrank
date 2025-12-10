import { useState, useEffect } from 'react';
import { BASE_URL } from '@/lib/constants';
import {
  MetricData,
  ChartDataPoint,
  ProjectData,
  UseRepoMetricsResult,
} from '@/types/metricType';

/**
 * Custom hook for fetching and processing repository metrics data
 * @param repo - Repository name
 * @param metrics - Array of metrics to fetch
 * @param platform - Platform (github, gitee, etc.)
 */
export default function useRepoMetrics(
  repo: string,
  metrics: string[],
  platform: string = 'github'
): UseRepoMetricsResult {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Merge chart data from multiple metrics
   * @param projectsData - Data from all metrics
   */
  const mergeChartData = (projectsData: ProjectData[]) => {
    // Get unique dates from all metrics
    const allDates = Array.from(
      new Set(
        projectsData.flatMap(project =>
          project.chartData.map(item => item.date)
        )
      )
    ).sort();

    // Create data points for each date containing data from all metrics
    const mergedData: ChartDataPoint[] = allDates.map(date => {
      const dataPoint: ChartDataPoint = { date };

      projectsData.forEach(project => {
        const projectData = project.chartData.find(item => item.date === date);
        dataPoint[project.name] = projectData ? projectData[project.name] : 0;
      });

      return dataPoint;
    });

    setChartData(mergedData);
  };

  /**
   * Fetch data for all metrics
   */
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const projectsData: ProjectData[] = [];

        for (const metric of metrics) {
          const url = `${BASE_URL}/${platform}/${repo}/${metric}.json`;
          const response = await fetch(url);

          if (!response.ok) {
            throw new Error(`No ${metric} data for ${repo}`);
          }

          const jsonData: MetricData = await response.json();

          // Convert data to chart-friendly format
          const formattedData: ChartDataPoint[] = Object.entries(jsonData)
            .filter(([key]) => key.match(/^\d{4}(-\d{2})$/)) // Keep only year-month data
            .map(([date, value]) => ({
              date,
              [metric]: typeof value === 'number' ? value : 0,
            }))
            .sort((a, b) => a.date.localeCompare(b.date)); // Sort by date

          projectsData.push({
            name: metric,
            rawData: jsonData,
            chartData: formattedData,
          });
        }

        mergeChartData(projectsData);
      } catch (err) {
        setError(
          (err as Error).message || 'An error occurred while fetching data'
        );
      } finally {
        setLoading(false);
      }
    };

    if (repo && metrics && metrics.length > 0) {
      fetchData();
    }
  }, [repo, metrics, platform]);

  return { chartData, loading, error };
}
