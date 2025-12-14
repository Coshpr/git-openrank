import { NextResponse } from 'next/server';
import { fetchRepoMetric } from '@/lib/utils';
import { generateSVG } from '@/lib/gen-svg';

// forbidden cache
export const dynamic = 'force-dynamic';

export const fetchCache = 'force-no-store';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const repo = searchParams.get('repo');
  const metric = searchParams.get('metric');
  const platform = searchParams.get('platform');
  const width = parseInt(searchParams.get('width') || '600');
  const height = parseInt(searchParams.get('height') || '300');

  // Validate required parameters
  if (!repo) {
    return new NextResponse('Missing required parameter: repo', {
      status: 400,
    });
  }

  if (!metric) {
    return new NextResponse('Missing required parameter: metric', {
      status: 400,
    });
  }

  if (!platform) {
    return new NextResponse('Missing required parameter: platform', {
      status: 400,
    });
  }

  try {
    // Fetch data for the repository
    const data = await fetchRepoMetric(repo, metric, platform);

    // Convert data to chart format and filter for valid date formats (YYYY-MM)
    const chartData = Object.entries(data)
      .filter(([key]) => key.match(/^\d{4}-\d{2}$/)) // Keep only year-month data
      .map(([date, value]) => ({
        date,
        repo,
        [metric]: typeof value === 'number' ? value : 0,
      }))
      .sort((a, b) => a.date.localeCompare(b.date)); // Sort by date

    // Generate SVG
    const svg = generateSVG(chartData, repo, metric, width, height);

    // Get current timestamp to prevent caching
    const timestamp = new Date().getTime();

    // Return SVG as response
    return new NextResponse(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control':
          'no-cache,no-store,must-revalidate,proxy-revalidate,max-age=0',
        Expires: '0',
        'Last-Modified': new Date().toUTCString(),
        ETag: `"${timestamp}"`,
      },
    });
  } catch (error: unknown) {
    console.error('Error generating SVG:', error);

    // Return error SVG
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorSvg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f8f9fa"/>
        <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" 
              font-family="Arial, sans-serif" font-size="16" fill="#dc3545">
          Error generating chart: ${errorMessage}
        </text>
      </svg>
    `;

    // Get current timestamp to prevent caching
    const timestamp = new Date().getTime();

    return new NextResponse(errorSvg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control':
          'no-cache,no-store,must-revalidate,proxy-revalidate,max-age=0',
        Expires: '0',
        'Last-Modified': new Date().toUTCString(),
        ETag: `"${timestamp}"`,
      },
    });
  }
}
