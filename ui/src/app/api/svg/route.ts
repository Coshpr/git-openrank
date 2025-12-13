import { NextResponse } from 'next/server';
import { fetchRepoMetric } from '@/lib/utils';

// Helper function to format date for display
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

// Helper function to generate SVG with chart data
function generateSVG(
  chartData: any[],
  repo: string,
  metric: string,
  width: number = 600,
  height: number = 300
): string {
  if (!chartData || chartData.length === 0) {
    return `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f8f9fa"/>
        <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" 
              font-family="Arial, sans-serif" font-size="16" fill="#6c757d">
          No data available
        </text>
      </svg>
    `;
  }

  // Find min and max values for scaling
  let minValue = Infinity;
  let maxValue = -Infinity;
  const dates: string[] = [];

  chartData.forEach((point: any) => {
    const value = point[metric];
    if (typeof value === 'number') {
      minValue = Math.min(minValue, value);
      maxValue = Math.max(maxValue, value);
    }
    dates.push(point.date);
  });

  // Handle case where all values are the same
  if (minValue === maxValue) {
    minValue = minValue - 1;
    maxValue = maxValue + 1;
  }

  // Round minValue down to nearest 10 and maxValue up to nearest 10
  const roundedMin = Math.floor(minValue / 10) * 10;
  const roundedMax = Math.ceil(maxValue / 10) * 10;

  // Use rounded values for display and scaling
  const paddedMin = roundedMin;
  const paddedMax = roundedMax;
  const actualRange = paddedMax - paddedMin;

  // Calculate points for the line
  const points: [number, number][] = [];
  const pointRadius = 3;
  const margin = { top: 40, right: 30, bottom: 50, left: 60 }; // Adjusted margins
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  chartData.forEach((point: any, index: number) => {
    const value = point[metric];
    if (typeof value === 'number') {
      const x = margin.left + (index / (chartData.length - 1)) * innerWidth;
      const y =
        margin.top +
        innerHeight -
        ((value - paddedMin) / actualRange) * innerHeight;
      points.push([x, y]);
    }
  });

  // Generate path for the line
  let pathData = '';
  if (points.length > 0) {
    pathData = `M ${points.map(([x, y]) => `${x},${y}`).join(' L ')}`;
  }

  // Generate dots for data points
  const dots = points
    .map(
      ([x, y]) =>
        `<circle cx="${x}" cy="${y}" r="${pointRadius}" fill="#3b82f6"/>`
    )
    .join('');

  // Generate X axis labels (show more dates)
  const xAxisLabels = [];
  if (dates.length > 0) {
    for (let i = 0; i < dates.length; i += Math.floor(dates.length / 5)) {
      xAxisLabels.push(
        `<text x="${margin.left + (i / (chartData.length - 1)) * innerWidth}" y="${height - 25}" font-family="Arial, sans-serif" font-size="12" fill="#495057" text-anchor="middle">${formatDate(dates[i])}</text>`
      );
    }
  }

  // Generate Y axis labels (min, middle, max) - now with rounded values
  const yAxisLabels = [
    `<text x="${margin.left - 10}" y="${margin.top + innerHeight}" font-family="Arial, sans-serif" font-size="12" fill="#495057" text-anchor="end" dominant-baseline="middle">${roundedMin}</text>`,
    `<text x="${margin.left - 10}" y="${margin.top + innerHeight / 2}" font-family="Arial, sans-serif" font-size="12" fill="#495057" text-anchor="end" dominant-baseline="middle">${Math.round((roundedMin + roundedMax) / 2)}</text>`,
    `<text x="${margin.left - 10}" y="${margin.top}" font-family="Arial, sans-serif" font-size="12" fill="#495057" text-anchor="end" dominant-baseline="middle">${roundedMax}</text>`,
  ];

  // Create the SVG
  return `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <!-- Background -->
      <rect width="100%" height="100%" fill="white"/>
      
      <!-- Axes -->
      <line x1="${margin.left}" y1="${margin.top}" x2="${margin.left}" y2="${height - margin.bottom}" stroke="#dee2e6" stroke-width="1"/>
      <line x1="${margin.left}" y1="${height - margin.bottom}" x2="${width - margin.right}" y2="${height - margin.bottom}" stroke="#dee2e6" stroke-width="1"/>
      
      <!-- Grid lines -->
      <line x1="${margin.left}" y1="${margin.top + innerHeight / 2}" x2="${width - margin.right}" y2="${margin.top + innerHeight / 2}" stroke="#f1f3f5" stroke-dasharray="5,5"/>
      <line x1="${margin.left}" y1="${margin.top}" x2="${width - margin.right}" y2="${margin.top}" stroke="#f1f3f5" stroke-dasharray="5,5"/>
      <line x1="${margin.left}" y1="${height - margin.bottom}" x2="${width - margin.right}" y2="${height - margin.bottom}" stroke="#f1f3f5" stroke-dasharray="5,5"/>
      
      <!-- Axis labels -->
      ${xAxisLabels.join('')}
      ${yAxisLabels.join('')}
      
      <!-- X axis title -->
      <text x="${width / 2}" y="${height - 5}" font-family="Arial, sans-serif" font-size="14" fill="#495057" text-anchor="middle">
        Timeline
      </text>
      
      <!-- Legend (top centered) -->
      <g transform="translate(${width / 2 - 50}, 15)">
        <circle cx="10" cy="10" r="4" fill="#3b82f6"/>
        <text x="20" y="14" font-family="Arial, sans-serif" font-size="12" fill="#495057">
          ${repo}-${metric}
        </text>
      </g>
      
      <!-- Chart line -->
      <path d="${pathData}" fill="none" stroke="#3b82f6" stroke-width="2"/>
      
      <!-- Data points -->
      ${dots}
    </svg>
  `;
}

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
      .filter(([key]) => key.match(/^\d{4}(-\d{2})$/)) // Keep only year-month data
      .map(([date, value]) => ({
        date,
        repo,
        [metric]: typeof value === 'number' ? value : 0,
      }))
      .sort((a, b) => a.date.localeCompare(b.date)); // Sort by date

    // Generate SVG
    const svg = generateSVG(chartData, repo, metric, width, height);

    // Return SVG as response
    return new NextResponse(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });
  } catch (error: any) {
    console.error('Error generating SVG:', error);

    // Return error SVG
    const errorSvg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f8f9fa"/>
        <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" 
              font-family="Arial, sans-serif" font-size="16" fill="#dc3545">
          Error generating chart: ${error.message}
        </text>
      </svg>
    `;

    return new NextResponse(errorSvg, {
      headers: {
        'Content-Type': 'image/svg+xml',
      },
    });
  }
}
