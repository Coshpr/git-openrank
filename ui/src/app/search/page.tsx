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
} from "recharts";

// 定义数据类型
interface MetricData {
  [key: string]: number | string;
}

interface ChartDataPoint {
  date: string;
  value: number;
}

// 创建一个内部组件来处理需要 suspense 的 hooks
function SearchContent() {
  const [platform, setPlatform] = useQueryState(
    "platform",
    parseAsString.withDefault("github")
  );
  const [name, setName] = useQueryState("name", parseAsString.withDefault(""));
  const [metric, setMetric] = useQueryState(
    "metric",
    parseAsString.withDefault("openrank")
  );
  const [data, setData] = useState<MetricData | null>(null);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 当URL参数变化时自动触发搜索
  useEffect(() => {
    if (name && platform && metric) {
      handleSearch();
    }
    // ignore warnings
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [platform, name, metric]);

  const handleSearch = async () => {
    if (!platform || !name || !metric) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError("");
    setData(null);
    setChartData([]);

    try {
      // 根据OpenDigger文档，API地址格式为: https://oss.open-digger.cn/{platform}/{org/login}/{repo}/{metric}.json
      const url = `https://oss.open-digger.cn/${platform}/${name}/${metric}.json`;
      const response = await fetch(url);

      console.log(response);

      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.status}`);
      }

      const jsonData: MetricData = await response.json();
      setData(jsonData);

      // 将数据转换为图表可用的格式
      const formattedData: ChartDataPoint[] = Object.entries(jsonData)
        .filter(([key]) => key.match(/^\d{4}(-\d{2})$/)) // 只保留年份和月份数据
        .map(([date, value]) => ({
          date,
          value: typeof value === "number" ? value : 0,
        }))
        .sort((a, b) => a.date.localeCompare(b.date)); // 按日期排序

      setChartData(formattedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // 判断使用哪种图表类型
  const renderChart = () => {
    if (chartData.length === 0) return null;

    // 如果数据点少于2个，使用柱状图，否则使用折线图
    if (chartData.length < 2) {
      return (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#8884d8" />
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
          <Line
            type="monotone"
            dataKey="value"
            stroke="#8884d8"
            activeDot={{ r: 8 }}
          />
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
                Project Name
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., facebook/react"
              />
            </div>

            {/* options */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 ">
                <label className="block font-medium">
                  Platform
                </label>
                <Select value={platform} onValueChange={setPlatform}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="github">GitHub</SelectItem>
                    <SelectItem value="gitlab">GitLab</SelectItem>
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
                    <SelectItem value="openrank">OpenRank</SelectItem>
                    <SelectItem value="activity">Activity</SelectItem>
                    <SelectItem value="attention">Attention</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="ml-auto">
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

      {data && (
        <Card>
          <CardHeader>
            <CardTitle>
              {metric.toUpperCase()} Trend for {name} on {platform}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renderChart()}

            {/* <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">Raw Data</h3>
              <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
                {JSON.stringify(data, null, 2)}
              </pre>
            </div> */}
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
