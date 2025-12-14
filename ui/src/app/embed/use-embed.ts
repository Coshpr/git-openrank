'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

export interface RepoData {
  id: string;
  platform: string;
  repo_name: string;
}

export const useEmbed = () => {
  const [repo, setRepo] = useState('');
  const [metric, setMetric] = useState('openrank');
  const [platform, setPlatform] = useState('github');
  const [width, setWidth] = useState('600');
  const [height, setHeight] = useState('300');
  const [repoOptions, setRepoOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [repoData, setRepoData] = useState<RepoData[]>([]);

  // --- load repo data
  useEffect(() => {
    const loadRepoData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          'https://oss.open-digger.cn/repo_list.csv'
        );
        const data = await response.text();

        // parse CSV
        const lines = data.split('\n').slice(1); // skip header
        const repos = lines
          .filter(line => line.trim() !== '')
          .map(line => {
            const [id, platform, repoName] = line.split(',');
            return { id, platform, repo_name: repoName };
          })
          .filter(item => item.repo_name); // filter out empty repo names

        setRepoData(repos);
      } catch (error) {
        console.error('Failed to load repo data:', error);
        toast.error('Failed to load repository data');
      } finally {
        setIsLoading(false);
      }
    };

    loadRepoData();
  }, []);

  // --- 根据输入过滤仓库选项
  const filterRepoOptions = useCallback(
    (input: string) => {
      // 如果没有输入，显示前10个仓库
      console.log('input', input);
      if (!input) {
        const topRepos = repoData.slice(0, 10).map(item => ({
          value: item.repo_name,
          label: item.repo_name,
        }));

        setRepoOptions(topRepos);
        return;
      }

      // 根据输入过滤仓库（最多显示10个）
      const filtered = repoData
        .filter(item =>
          item.repo_name.toLowerCase().includes(input.toLowerCase())
        )
        .slice(0, 10)
        .map(item => ({ value: item.repo_name, label: item.repo_name }));

      setRepoOptions(filtered);
    },
    [repoData]
  );

  const svgUrl = useMemo(() => {
    if (!repo) return '';
    const params = new URLSearchParams({
      repo,
      metric,
      platform,
      width,
      height,
    });
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    return `${baseUrl}/api/svg?${params.toString()}`;
  }, [repo, metric, platform, width, height]);

  return {
    repo,
    setRepo,
    metric,
    setMetric,
    platform,
    setPlatform,
    width,
    setWidth,
    height,
    setHeight,
    repoOptions,
    isLoading,
    svgUrl,
    filterRepoOptions,
  };
};
