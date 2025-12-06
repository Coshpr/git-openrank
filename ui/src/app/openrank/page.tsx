"use client";

import { useState, useEffect, Suspense } from "react";
import { useQueryState, parseAsString } from "nuqs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { base_url, metrics, platforms } from "./metrics";

// 定义数据类型
interface MetricData {
  [key: string]: number | string;
}

interface ChartDataPoint {
  date: string;
  [key: string]: number | string;
}

interface ProjectData {
  name: string;
  data: MetricData;
  chartData: ChartDataPoint[];
}

// 创建一个内部组件来处理需要 suspense 的 hooks
function SearchContent() {
  const [platform, setPlatform] = useQueryState(
    "platform",
    parseAsString.withDefault("github")
  );
  const [names, setNames] = useQueryState(
    "names",
    parseAsString.withDefault("facebook/react, vuejs/vue, angular/angular,vercel/next.js")
  );
  const [metric, setMetric] = useQueryState(
    "metric",
    parseAsString.withDefault("openrank")
  );
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 解析项目名称列表
  const parseNames = (namesStr: string): string[] => {
    return namesStr
      .split(",")
      .map((name) => {
        // 自动去除 GitHub 链接前缀
        const trimmedName = name.trim();
        if (trimmedName.startsWith('https://github.com/')) {
          return trimmedName.substring('https://github.com/'.length);
        }
        return trimmedName;
      })
      .filter((name) => name.length > 0);
  };

  // 当URL参数变化时自动触发搜索
  useEffect(() => {
    if (names && platform && metric) {
      handleSearch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [platform, names, metric]);

  const handleSearch = async () => {
    const nameList = parseNames(names);
    if (!platform || nameList.length === 0 || !metric) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError("");
    setProjects([]);
    setChartData([]);

    try {
      // 获取所有项目的数据
      const projectsData: ProjectData[] = [];

      for (const name of nameList) {
        // 根据OpenDigger文档，API地址格式为: https://oss.open-digger.cn/{platform}/{org/login}/{repo}/{metric}.json
        const url = `${base_url}/${platform}/${name}/${metric}.json`;
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(
            `Failed to fetch data for ${name}: ${response.status}`
          );
        }

        const jsonData: MetricData = await response.json();

        // 将数据转换为图表可用的格式
        const formattedData: ChartDataPoint[] = Object.entries(jsonData)
          .filter(([key]) => key.match(/^\d{4}(-\d{2})$/)) // 只保留年份和月份数据
          .map(([date, value]) => ({
            date,
            [name]: typeof value === "number" ? value : 0,
          }))
          .sort((a, b) => a.date.localeCompare(b.date)); // 按日期排序

        projectsData.push({
          name,
          data: jsonData,
          chartData: formattedData,
        });
      }

      setProjects(projectsData);

      // 合并所有项目的数据用于图表展示
      mergeChartData(projectsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // 合并多个项目的数据用于图表展示
  const mergeChartData = (projectsData: ProjectData[]) => {
    // 收集所有唯一的日期
    const allDates = Array.from(
      new Set(
        projectsData.flatMap((project) =>
          project.chartData.map((item) => item.date)
        )
      )
    ).sort();

    // 为每个日期创建数据点，包含所有项目的数据
    const mergedData: ChartDataPoint[] = allDates.map((date) => {
      const dataPoint: ChartDataPoint = { date };

      projectsData.forEach((project) => {
        const projectData = project.chartData.find(
          (item) => item.date === date
        );
        dataPoint[project.name] = projectData ? projectData[project.name] : 0;
      });

      return dataPoint;
    });

    setChartData(mergedData);
  };

  const renderChart = () => {
    if (chartData.length === 0) return null;
    const projectNames = parseNames(names);

    if (chartData.length < 2) {
      return (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            {projectNames.map((name, index) => {
              const colors = [
                "#8884d8",
                "#82ca9d",
                "#ffc658",
                "#ff7300",
                "#00ff00",
              ];
              return (
                <Bar
                  key={name}
                  dataKey={name}
                  fill={colors[index % colors.length]}
                />
              );
            })}
          </BarChart>
        </ResponsiveContainer>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          {projectNames.map((name, index) => {
            const colors = [
              "#8884d8",
              "#82ca9d",
              "#ffc658",
              "#ff7300",
              "#00ff00",
            ];
            return (
              <Line
                key={name}
                type="monotone"
                dataKey={name}
                stroke={colors[index % colors.length]}
                activeDot={{ r: 8 }}
                strokeWidth={2}
              />
            );
          })}
        </LineChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="container mx-auto py-8 max-w-6xl">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Search Open Source Project Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 text-sm ">
            {/* input */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Project Names (comma separated)
              </label>
              <Input
                value={names}
                onChange={(e) => setNames(e.target.value)}
                placeholder="e.g., facebook/react, vuejs/vue, angular/angular"
              />
            </div>

            {/* options */}
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex items-center gap-2 ">
                <label className="block font-medium">Platform</label>
                <Select value={platform} onValueChange={setPlatform}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent >
                    {platforms.map((p) => (
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
                    {metrics.map((m) => (
                      <SelectItem key={m.value} value={m.value}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="ml-0 md:ml-auto">
                <Button
                  onClick={handleSearch}
                  disabled={loading}
                  className="w-full"
                  size="sm"
                  variant="outline"
                >
                  {loading ? "Searching..." : "Search"}
                </Button>
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      {projects.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>
              <div className="flex items-center gap-2">
                <div className="px-2 py-1 rounded-full text-sm border w-fit">
                  {metrics.find((m) => m.value === metric)?.label || metric}{" "}
                </div>
                <div>Trend Comparison</div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renderChart()}

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((project) => (
                <Card key={project.name}>
                  <CardHeader>
                    <CardTitle>{project.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm">
                      <p>
                        Last value:{" "}
                        {project.chartData.length > 0
                          ? project.chartData[project.chartData.length - 1][
                              project.name
                            ]
                          : "N/A"}
                      </p>
                      <p>Data points: {project.chartData.length}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
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
