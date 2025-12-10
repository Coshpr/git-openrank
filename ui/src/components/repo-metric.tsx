import { useState, useEffect } from 'react';
import { base_url, default_colors } from '@/lib/constants';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface RepoMetricProps {
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

interface MetricData {
  [key: string]: number | string;
}

interface ChartDataPoint {
  date: string;
  [key: string]: number | string;
}

interface ProjectData {
  name: string;
  rawData: MetricData;
  chartData: ChartDataPoint[];
}

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
}: RepoMetricProps) {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const mergeChartData = (projectsData: ProjectData[]) => {
    // get unique dates
    const allDates = Array.from(
      new Set(
        projectsData.flatMap(project =>
          project.chartData.map(item => item.date)
        )
      )
    ).sort();

    // 为每个日期创建数据点，包含所有项目的数据
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const projectsData: ProjectData[] = [];

        for (const metric of metrics) {
          const url = `${base_url}/${platform}/${repo}/${metric}.json`;
          const response = await fetch(url);

          if (!response.ok) {
            throw new Error(
              `Failed to fetch data for ${repo} - ${metric}: ${response.status}`
            );
          }

          const jsonData: MetricData = await response.json();
          // 2016:195.19
          // 2016-10:38.22
          // 2016-11:63.41
          // 2016-12:93.56
          // 2016Q4:195.19
          // 2017:1506.37
          // 2017-01:117.48
          // ...

          // 将数据转换为图表可用的格式
          const formattedData: ChartDataPoint[] = Object.entries(jsonData)
            .filter(([key]) => key.match(/^\d{4}(-\d{2})$/)) // 只保留年份和月份数据
            .map(([date, value]) => ({
              date,
              [metric]: typeof value === 'number' ? value : 0,
            }))
            .sort((a, b) => a.date.localeCompare(b.date)); // 按日期排序

          projectsData.push({
            name: `${metric}`, // 为每个指标创建唯一名称
            rawData: jsonData,
            chartData: formattedData,
          });
        }
        console.log(projectsData);

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

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  // 渲染不同类型的图表
  const renderChart = () => {
    switch (figType) {
      case 'bar':
        return (
          <BarChart data={chartData}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            {showXAxis && <XAxis dataKey="date" />}
            {showYAxis && <YAxis />}
            {showTooltip && <Tooltip />}
            {showLegend && <Legend />}
            {metrics.map((metric, index) => (
              <Bar
                key={metric}
                dataKey={metric}
                fill={default_colors[index % default_colors.length]}
              />
            ))}
          </BarChart>
        );

      case 'area':
        return (
          <AreaChart data={chartData}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            {showXAxis && <XAxis dataKey="date" />}
            {showYAxis && <YAxis />}
            {showTooltip && <Tooltip />}
            {showLegend && <Legend />}
            {metrics.map((metric, index) => (
              <Area
                key={metric}
                type="monotone"
                dataKey={metric}
                stroke={default_colors[index % default_colors.length]}
                fill={default_colors[index % default_colors.length]}
                fillOpacity={0.3}
              />
            ))}
          </AreaChart>
        );

      // 默认使用折线图
      default:
        return (
          <LineChart data={chartData}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            {showXAxis && <XAxis dataKey="date" />}
            {showYAxis && <YAxis />}
            {showTooltip && <Tooltip />}
            {showLegend && <Legend />}
            {metrics.map((metric, index) => (
              <Line
                key={metric}
                type="monotone"
                dataKey={metric}
                stroke={default_colors[index % default_colors.length]}
                activeDot={{ r: 4 }}
                strokeWidth={2}
              />
            ))}
          </LineChart>
        );
    }
  };

  return (
    <ResponsiveContainer width={width} height={height}>
      {renderChart()}
    </ResponsiveContainer>
  );
}
