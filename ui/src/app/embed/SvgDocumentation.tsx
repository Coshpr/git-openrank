'use client';

import React, { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Image from 'next/image';
import { METRICS, PLATFORMS } from '@/lib/constants';
import { CopyIcon, EyeIcon } from 'lucide-react';
import { toast } from 'sonner';

const SvgDocumentation = () => {
  const [repo, setRepo] = useState('');
  const [metric, setMetric] = useState('openrank');
  const [platform, setPlatform] = useState('github');
  const [width, setWidth] = useState('600');
  const [height, setHeight] = useState('300');
  const [copied, setCopied] = useState(false);

  // 使用 useMemo 优化 SVG URL 的生成
  const svgUrl = useMemo(() => {
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

  // 替代方案复制函数
  const fallbackCopyTextToClipboard = (text: string) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;

    // 避免滚动到底部
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      document.body.removeChild(textArea);
      return false;
    }
  };

  const copyTextToClipboard = async (text: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (err) {
        // 如果现代剪贴板 API 失败，则使用备选方案
        return fallbackCopyTextToClipboard(text);
      }
    } else {
      // 如果没有现代剪贴板 API，则使用备选方案
      return fallbackCopyTextToClipboard(text);
    }
  };

  const handleCopy = async () => {
    const successful = await copyTextToClipboard(svgUrl);
    if (successful) {
      setCopied(true);
      toast.success('SVG URL copied to clipboard!');

      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } else {
      toast.error('Failed to copy SVG URL to clipboard');
    }
  };

  return (
    <div className="">
      <h2 className="text-2xl font-bold mb-4">Embed Openrank SVG Chart</h2>
      <p className="mb-6 text-gray-600 dark:text-gray-300">
        Generate SVG charts for repository metrics that can be embedded in
        Markdown or HTML.
      </p>

      <div className="flex flex-wrap gap-6 mb-6">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium mb-2">Repository</label>
          <Input
            value={repo}
            onChange={e => setRepo(e.target.value)}
            placeholder="e.g., facebook/react"
          />
        </div>

        <div className="min-w-[150px]">
          <label className="block text-sm font-medium mb-2">Platform</label>
          <Select value={platform} onValueChange={setPlatform}>
            <SelectTrigger>
              <SelectValue placeholder="Select platform" />
            </SelectTrigger>
            <SelectContent>
              {PLATFORMS.map(p => (
                <SelectItem key={p.value} value={p.value}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="min-w-[150px]">
          <label className="block text-sm font-medium mb-2">Metric</label>
          <Select value={metric} onValueChange={setMetric}>
            <SelectTrigger>
              <SelectValue placeholder="Select metric" />
            </SelectTrigger>
            <SelectContent>
              {METRICS.map(m => (
                <SelectItem key={m.value} value={m.value}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {repo != '' && (
        <>
          <div className="mb-6 flex gap-4 justify-start">
            <Button
              className=""
              size="sm"
              onClick={handleCopy}
              variant="outline"
            >
              <CopyIcon size="8" />
              {copied ? 'Copied!' : 'Link'}
            </Button>

            <Button
              className=""
              size="sm"
              onClick={() => {
                // 确保只在浏览器环境中执行
                if (typeof window !== 'undefined') {
                  // 使用带属性的 window.open 确保窗口能够正确打开
                  window.open(svgUrl, '_blank', 'noopener,noreferrer');
                }
              }}
              variant="outline"
            >
              <EyeIcon size="8" />
              Preview
            </Button>
          </div>

          <div className="flex justify-center items-center mb-6">
            <Image
              src={svgUrl}
              alt="SVG Chart Preview"
              width={parseInt(width)}
              height={parseInt(height)}
              unoptimized={true}
              className="max-w-full border rounded-lg shadow-sm"
            />
          </div>

          <div>
            <div className=" text-sm font-medium mb-2 flex gap-1 items-center">
              <div>Markdown Usage</div>
              <Button
                className="ml-2"
                size="icon"
                variant="link"
                onClick={async () => {
                  const markdownCode = `![${metric} for ${repo}](${svgUrl})`;
                  const successful = await copyTextToClipboard(markdownCode);

                  if (successful) {
                    toast.success('Markdown code copied to clipboard!');
                  } else {
                    toast.error('Failed to copy Markdown code to clipboard');
                  }
                }}
              >
                <CopyIcon size="8" />
              </Button>
            </div>
            <div className="p-6 bg-gray-100 border rounded-md">{`![${metric} for ${repo}](${svgUrl})`}</div>
            <p className="mt-2 text-sm text-gray-500">
              Copy and paste this Markdown code to embed the chart in your
              documents.
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default SvgDocumentation;
