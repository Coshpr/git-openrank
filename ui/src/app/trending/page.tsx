'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ArrowUp, GitFork, Star } from 'lucide-react';

interface Language {
  label: string;
  key: string;
}

interface Repo {
  repo: string;
  desc: string;
  lang: string;
  stars: number;
  forks: number;
  change: number;
  build_by: Array<{ avatar: string; by: string }>;
}

export default function TrendingPage() {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('unknown');
  const [selectedSince, setSelectedSince] = useState<string>('daily');
  const [repos, setRepos] = useState<Repo[]>([]);
  const [isLanguageDialogOpen, setIsLanguageDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState(''); // 添加搜索状态

  // 获取支持的语言列表
  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const response = await fetch('/api/trend/lang');
        if (!response.ok) {
          throw new Error(`Failed to fetch languages: ${response.status}`);
        }
        const data: Language[] = await response.json();
        setLanguages(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchLanguages();
  }, []);

  // 根据选择的语言和时间范围获取仓库列表
  useEffect(() => {
    const fetchRepos = async () => {
      if (!selectedLanguage) return;

      try {
        setLoading(true);
        const response = await fetch(
          `/api/trend/repo?language=${encodeURIComponent(
            selectedLanguage
          )}&since=${selectedSince}`
        );
        if (!response.ok) {
          throw new Error(`Failed to fetch repos: ${response.status}`);
        }
        const data: Repo[] = await response.json();
        setRepos(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchRepos();
  }, [selectedLanguage, selectedSince]); // 添加selectedSince到依赖数组

  const handleLanguageSelect = (languageKey: string) => {
    setSelectedLanguage(languageKey);
    setIsLanguageDialogOpen(false);
  };

  const renderLanguageGrid = () => {
    // 根据搜索词过滤语言列表
    const filteredLanguages = searchTerm
      ? languages.filter(lang =>
          lang.label.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : languages;

    const itemsPerRow = 4;
    const rows = [];
    // 限制只显示两行内容
    const displayLanguages = filteredLanguages.slice(0, itemsPerRow * 4);

    for (let i = 0; i < displayLanguages.length; i += itemsPerRow) {
      const rowItems = displayLanguages.slice(i, i + itemsPerRow);
      rows.push(
        <div key={i} className="grid grid-cols-4 gap-2 mb-2">
          {rowItems.map((language, index) => (
            <Button
              key={`${language.key}-${i}-${index}`}
              variant="outline"
              className="h-10 text-xs px-2 line-clamp-2"
              onClick={() => handleLanguageSelect(language.key)}
            >
              {language.label}
            </Button>
          ))}
        </div>
      );
    }

    return rows;
  };

  // 渲染搜索框
  const renderSearchBox = () => (
    <div className="mb-4">
      <input
        type="text"
        placeholder="Search languages..."
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">
          GitHub Trending Repositories
        </h1>

        {/* 添加时间范围选择和搜索框 */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-2">
            <Label className="whitespace-nowrap">Time Range:</Label>
            <RadioGroup
              value={selectedSince}
              onValueChange={setSelectedSince}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-1">
                <RadioGroupItem value="daily" id="daily" />
                <Label htmlFor="daily">Daily</Label>
              </div>
              <div className="flex items-center space-x-1">
                <RadioGroupItem value="weekly" id="weekly" />
                <Label htmlFor="weekly">Weekly</Label>
              </div>
              <div className="flex items-center space-x-1">
                <RadioGroupItem value="monthly" id="monthly" />
                <Label htmlFor="monthly">Monthly</Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Dialog
              open={isLanguageDialogOpen}
              onOpenChange={setIsLanguageDialogOpen}
            >
              <DialogTrigger asChild>
                <Button variant="outline" className="text-xs" size="sm">
                  {selectedLanguage
                    ? languages.find(lang => lang.key === selectedLanguage)
                        ?.label || 'Select Language'
                    : 'Select Language'}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] max-w-[90vw] w-[600px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Select a Language</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                  {renderSearchBox()}
                  {loading && languages.length === 0 ? (
                    <div className="flex justify-center items-center h-32">
                      <p>Loading languages...</p>
                    </div>
                  ) : error && languages.length === 0 ? (
                    <div className="text-red-500 text-center py-4">
                      Error: {error}
                    </div>
                  ) : (
                    renderLanguageGrid()
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {error && !loading && (
          <div className="mb-8 p-4 bg-red-100 text-red-700 rounded text-center">
            Error: {error}
          </div>
        )}

        {loading && selectedLanguage ? (
          <div className="flex justify-center items-center h-64">
            <p>Loading repositories...</p>
          </div>
        ) : repos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {repos
              .filter(repo => {
                if (!searchTerm) return true;
                const searchLower = searchTerm.toLowerCase();
                return (
                  repo.repo.toLowerCase().includes(searchLower) ||
                  (repo.desc &&
                    repo.desc.toLowerCase().includes(searchLower)) ||
                  repo.lang.toLowerCase().includes(searchLower)
                );
              })
              .map((repo, index) => (
                <Card key={index} className="flex flex-col">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">
                          <a
                            href={`https://github.com${repo.repo}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline"
                          >
                            {repo.repo.split('/')[2] || repo.repo.substring(1)}
                          </a>
                        </CardTitle>
                        <CardDescription className="mt-2">
                          {repo.desc}
                        </CardDescription>
                      </div>
                      <span className="bg-zinc-100 dark:bg-zinc-800 text-xs px-2 py-1 rounded">
                        {repo.lang}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="mt-auto">
                    <div className="flex justify-between text-sm text-zinc-500 dark:text-zinc-400 mb-4">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-amber-500"></Star>
                        {repo.stars.toLocaleString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <GitFork className="h-4 w-4" />{' '}
                        {repo.forks.toLocaleString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <ArrowUp className="h-4 w-4 text-red-500" />{' '}
                        {repo.change > 0 ? `${repo.change}` : repo.change}
                      </div>
                    </div>
                    <div className="flex items-center mb-4">
                      <span className="text-xs text-zinc-500 dark:text-zinc-400 mr-2">
                        Built by:
                      </span>
                      <div className="flex">
                        {repo.build_by.slice(0, 5).map((contributor, idx) => (
                          <div
                            key={idx}
                            className="relative"
                            style={{ marginLeft: idx === 0 ? 0 : -8 }}
                          >
                            <Image
                              src={contributor.avatar}
                              alt={contributor.by}
                              width={24}
                              height={24}
                              className="rounded-full border-2 border-white dark:border-zinc-900"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="pt-2">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                          const repoName = repo.repo.startsWith('/')
                            ? repo.repo.substring(1)
                            : repo.repo;
                          window.open(
                            `/metrics?names=${encodeURIComponent(
                              repoName
                            )}&platform=github`,
                            '_blank'
                          );
                        }}
                      >
                        View OpenRank
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        ) : selectedLanguage ? (
          <div className="text-center py-12">
            <p>No repositories found for this language.</p>
          </div>
        ) : (
          <div className="text-center py-12">
            <p>Select a language to view trending repositories.</p>
          </div>
        )}
      </div>
    </div>
  );
}
