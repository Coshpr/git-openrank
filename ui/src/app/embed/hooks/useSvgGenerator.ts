'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

// 定义仓库数据类型
export interface RepoData {
  id: string;
  platform: string;
  repo_name: string;
}

export const useSvgGenerator = () => {
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

  // 加载仓库列表数据
  useEffect(() => {
    const loadRepoData = async () => {
      setIsLoading(true);
      try {
        // 从网络获取数据
        const response = await fetch(
          'https://oss.open-digger.cn/repo_list.csv'
        );
        const data = await response.text();

        // 解析CSV数据
        const lines = data.split('\n').slice(1); // 跳过标题行
        const repos = lines
          .filter(line => line.trim() !== '')
          .map(line => {
            const [id, platform, repoName] = line.split(',');
            return { id, platform, repo_name: repoName };
          })
          .filter(item => item.repo_name); // 过滤掉无效数据

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

  // 根据输入过滤仓库选项
  const filterRepoOptions = useCallback(
    (input: string) => {
      // 如果没有输入，显示前10个仓库
      if (!input) {
        const topRepos = repoData.slice(0, 10).map(item => ({
          value: item.repo_name,
          label: item.repo_name,
        }));

        // 如果已有选择且在前10中，则保持选择
        if (repo && topRepos.some(option => option.value === repo)) {
          setRepoOptions(topRepos);
          return;
        }

        // 如果已有选择但不在前10中，则添加到选项中
        if (repo && !topRepos.some(option => option.value === repo)) {
          const selectedRepo = repoData.find(item => item.repo_name === repo);
          if (selectedRepo) {
            setRepoOptions([
              { value: selectedRepo.repo_name, label: selectedRepo.repo_name },
              ...topRepos,
            ]);
            return;
          }
        }

        setRepoOptions(topRepos);
        return;
      }

      // 根据输入过滤仓库（最多显示10个）
      let filtered = repoData
        .filter(item =>
          item.repo_name.toLowerCase().includes(input.toLowerCase())
        )
        .slice(0, 10)
        .map(item => ({ value: item.repo_name, label: item.repo_name }));

      // 确保已选择的仓库始终在列表中
      if (repo && !filtered.some(option => option.value === repo)) {
        const selectedRepo = repoData.find(item => item.repo_name === repo);
        if (selectedRepo) {
          filtered = [
            { value: selectedRepo.repo_name, label: selectedRepo.repo_name },
            ...filtered,
          ];
        }
      }

      setRepoOptions(filtered);
    },
    [repo, repoData]
  );

  // 当仓库输入改变时更新选项
  useEffect(() => {
    filterRepoOptions(repo);
  }, [repo, filterRepoOptions]);

  // 使用 useMemo 优化 SVG URL 的生成
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
    // State values
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

    // Functions
    filterRepoOptions,
  };
};