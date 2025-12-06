"use client";

import { useState, useEffect } from "react";
import { useQueryState, parseAsString } from 'nuqs';
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
  Bar
} from "recharts";

// 定义数据类型
interface MetricData {
  [key: string]: number | string;
}

interface ChartDataPoint {
  date: string;
  value: number;
}

export default function SearchPage() {
  const [platform, setPlatform] = useQueryState('platform', parseAsString.withDefault('github'));
  const [name, setName] = useQueryState('name', parseAsString.withDefault(''));
  const [metric, setMetric] = useQueryState('metric', parseAsString.withDefault('openrank'));
  const [data, setData] = useState<MetricData | null>(null);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 当URL参数变化时自动触发搜索
  useEffect(() => {
    if (name && platform && metric) {
      handleSearch();
    }
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
        .filter(([key]) => key.match(/^\d{4}(-\d{2})?$/)) // 只保留年份和月份数据
        .map(([date, value]) => ({
          date,
          value: typeof value === 'number' ? value : 0
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
    <div className="min-h-screen bg-zinc-50 dark:bg-black p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">OpenDigger Metrics Search</h1>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Search Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4">
              {/* Name input takes the full row */}
              <div className="grid grid-cols-1 gap-4">
                <Input
                  placeholder="Enter org/repo or user login"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              
              {/* Platform, metric and submit button on second row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Select onValueChange={setPlatform} value={platform}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Platform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="github">GitHub</SelectItem>
                    <SelectItem value="gitee">Gitee</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select onValueChange={setMetric} value={metric}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Metric" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="openrank">OpenRank</SelectItem>
                    <SelectItem value="activity">Activity</SelectItem>
                    <SelectItem value="stars">Stars</SelectItem>
                    <SelectItem value="contributors">Contributors</SelectItem>
                    <SelectItem value="issues_new">New Issues</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button onClick={handleSearch} disabled={loading}>
                  {loading ? "Searching..." : "Submit"}
                </Button>
              </div>
            </div>
            
            {error && (
              <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
                Error: {error}
              </div>
            )}
          </CardContent>
        </Card>
        
        <div className="space-y-8">
          {data && (
            <Card>
              <CardHeader>
                <CardTitle>Visualization</CardTitle>
              </CardHeader>
              <CardContent>
                {chartData.length > 0 ? (
                  <div className="h-96">
                    {renderChart()}
                  </div>
                ) : (
                  <div className="h-96 flex items-center justify-center">
                    <p>No chart data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
          
          <Card>
            <CardHeader>
              <CardTitle>Raw Data</CardTitle>
            </CardHeader>
            <CardContent>
              {data ? (
                <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
                  {JSON.stringify(data, null, 2)}
                </pre>
              ) : (
                <p className="text-gray-500 italic">No data available. Enter search criteria and click Submit.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}