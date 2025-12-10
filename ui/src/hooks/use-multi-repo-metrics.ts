import { useState, useEffect } from 'react';
import { BASE_URL } from '@/lib/constants';
import {
  MetricData,
  ChartDataPoint,
  ProjectData,
  UseMultiRepoMetricsResult,
} from '../types/metricType';

/**
 * Custom hook for fetching and processing multi-repository metric data
 * @param repos - Array of repository names
 * @param metric - Metric to fetch
 * @param platform - Platform (github, gitee, etc.)
 */
export default function useMultiRepoMetrics(
  repos: string[],
  metric: string,
  platform: string = 'github'
): UseMultiRepoMetricsResult {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Merge chart data from multiple repositories
   * @param projectsData - Data from all repositories
   */
  const mergeChartData = (projectsData: ProjectData[]) => {
    // Get unique dates from all repositories
    const allDates = Array.from(
      new Set(
        projectsData.flatMap(project =>
          project.chartData.map(item => item.date)
        )
      )
    ).sort();

    // Create data points for each date containing data from all repositories
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
   * Fetch data for all repositories
   */
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const projectsData: ProjectData[] = [];

        for (const repo of repos) {
          const url = `${BASE_URL}/${platform}/${repo}/${metric}.json`;
          const response = await fetch(url);

          if (!response.ok) {
            throw new Error(
              `Failed to fetch data for ${repo} - ${metric}: ${response.status}`
            );
          }

          const jsonData: MetricData = await response.json();

          // Convert data to chart-friendly format
          const formattedData: ChartDataPoint[] = Object.entries(jsonData)
            .filter(([key]) => key.match(/^\d{4}(-\d{2})$/)) // Keep only year-month data
            .map(([date, value]) => ({
              date,
              [repo]: typeof value === 'number' ? value : 0,
            }))
            .sort((a, b) => a.date.localeCompare(b.date)); // Sort by date

          projectsData.push({
            name: repo,
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

    if (repos && metric && repos.length > 0) {
      fetchData();
    }
  }, [repos, metric, platform]);

  return { chartData, loading, error };
}
