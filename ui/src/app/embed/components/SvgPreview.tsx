'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { CopyIcon, EyeIcon } from 'lucide-react';
import { toast } from 'sonner';

interface SvgPreviewProps {
  svgUrl: string;
  width: string;
  height: string;
  metric: string;
  repo: string;
}

const SvgPreview: React.FC<SvgPreviewProps> = ({
  svgUrl,
  width,
  height,
  metric,
  repo,
}) => {
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

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

  const handleCopyMarkdown = async () => {
    const markdownCode = `![${metric} for ${repo}](${svgUrl})`;
    const successful = await copyTextToClipboard(markdownCode);

    if (successful) {
      toast.success('Markdown code copied to clipboard!');
    } else {
      toast.error('Failed to copy Markdown code to clipboard');
    }
  };

  return (
    <>
      <div className="mb-6 flex gap-4 justify-start">
        <Button className="" size="sm" onClick={handleCopy} variant="outline">
          <CopyIcon size="8" />
          {copied ? 'Copied!' : 'Link'}
        </Button>

        <Button
          className=""
          size="sm"
          onClick={() => {
            if (typeof window !== 'undefined') {
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
        {loading && (
          <div
            className="flex justify-center items-center border rounded-lg shadow-sm bg-gray-50"
            style={{ width: parseInt(width), height: parseInt(height) }}
          >
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}
        <Image
          src={svgUrl}
          alt="SVG Chart Preview"
          width={parseInt(width)}
          height={parseInt(height)}
          unoptimized={true}
          className={`max-w-full border rounded-lg shadow-sm ${loading ? 'hidden' : 'block'}`}
          onLoadingComplete={() => setLoading(false)}
        />
      </div>

      <div>
        <div className=" text-sm font-medium mb-2 flex gap-1 items-center">
          <div>Markdown Usage</div>
          <Button
            className="ml-2"
            size="icon"
            variant="link"
            onClick={handleCopyMarkdown}
          >
            <CopyIcon size="8" />
          </Button>
        </div>
        <div className="p-6 bg-gray-100 border rounded-md">
          {`![${metric} for ${repo}](${svgUrl})`}
        </div>
        <p className="mt-2 text-sm text-gray-500">
          Copy and paste this Markdown code to embed the chart in your
          documents.
        </p>
      </div>
    </>
  );
};

export default SvgPreview;
