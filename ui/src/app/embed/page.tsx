'use client';

import { useEmbed } from './use-embed';
import RepoInput from './components/RepoInput';
import ParameterSelector from './components/ParameterSelector';
import SvgPreview from './components/SvgPreview';

export default function EmbedPage() {
  const {
    repo,
    setRepo,
    metric,
    setMetric,
    platform,
    setPlatform,
    width,
    height,
    repoOptions,
    isLoading,
    svgUrl,
  } = useEmbed();

  return (
    <div className="min-h-[60vh] bg-zinc-50 dark:bg-black p-8">
      <div className="max-w-6xl mx-auto ">
        <h2 className="text-2xl font-bold mb-4">Embed Openrank SVG Chart</h2>
        <p className="mb-6 text-gray-600 dark:text-gray-300">
          Generate SVG charts for repository metrics that can be embedded in
          Markdown or HTML.
        </p>

        <div className="flex flex-wrap gap-6 mb-6">
          <RepoInput
            repo={repo}
            setRepo={setRepo}
            repoOptions={repoOptions}
            isLoading={isLoading}
          />

          <ParameterSelector
            platform={platform}
            setPlatform={setPlatform}
            metric={metric}
            setMetric={setMetric}
          />
        </div>

        {repo != '' && (
          <SvgPreview
            svgUrl={svgUrl}
            width={width}
            height={height}
            metric={metric}
            repo={repo}
          />
        )}
      </div>
    </div>
  );
}
