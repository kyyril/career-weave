import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
    }

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch URL' }, { status: 400 });
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Remove unwanted elements
    $('script, style, nav, footer, header, .navigation, .menu, .sidebar, .ads, .advertisement').remove();

    // Try to extract job-specific content
    let jobText = '';
    
    // Common job description selectors
    const jobSelectors = [
      '[class*="job-description"]',
      '[class*="job-detail"]',
      '[class*="description"]',
      '[class*="content"]',
      'main',
      'article',
      '.job-posting',
      '#job-description'
    ];

    for (const selector of jobSelectors) {
      const element = $(selector);
      if (element.length > 0) {
        jobText = element.text().trim();
        if (jobText.length > 200) { // Ensure we have substantial content
          break;
        }
      }
    }

    // Fallback to body if no specific content found
    if (!jobText || jobText.length < 200) {
      jobText = $('body').text().trim();
    }

    // Clean up the text
    jobText = jobText
      .replace(/\s+/g, ' ') // Replace multiple whitespace with single space
      .replace(/\n+/g, '\n') // Replace multiple newlines with single newline
      .trim();

    // Limit text length to avoid token limits
    if (jobText.length > 5000) {
      jobText = jobText.substring(0, 5000) + '...';
    }

    if (!jobText || jobText.length < 50) {
      return NextResponse.json({ error: 'Could not extract meaningful content from URL' }, { status: 400 });
    }

    return NextResponse.json({ text: jobText });
  } catch (error) {
    console.error('Scraping error:', error);
    return NextResponse.json({ error: 'Failed to scrape URL' }, { status: 500 });
  }
}