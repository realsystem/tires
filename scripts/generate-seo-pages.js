#!/usr/bin/env node

/**
 * SEO Page Generator
 * Generates static HTML landing pages for top tire comparisons
 *
 * Usage: node scripts/generate-seo-pages.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseTireSize } from '../src/engine/tireParser.js';
import { calculateTireComparison } from '../src/engine/tireCalculator.js';
import { generatePageContent } from './content-templates.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.join(__dirname, '..');
const SEO_DATA_PATH = path.join(__dirname, 'seo-data.json');
const TEMPLATE_PATH = path.join(PROJECT_ROOT, 'public', 'template-seo.html');
const OUTPUT_DIR = path.join(PROJECT_ROOT, 'public', 'comparisons');
const SITEMAP_PATH = path.join(PROJECT_ROOT, 'public', 'sitemap.xml');

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Starting SEO page generation...\n');

  // Load SEO page definitions
  const seoData = JSON.parse(fs.readFileSync(SEO_DATA_PATH, 'utf-8'));
  console.log(`📄 Loaded ${seoData.length} page definitions from seo-data.json\n`);

  // Load HTML template
  if (!fs.existsSync(TEMPLATE_PATH)) {
    console.error(`❌ Template not found at ${TEMPLATE_PATH}`);
    console.log('Please create the template first.');
    process.exit(1);
  }
  const template = fs.readFileSync(TEMPLATE_PATH, 'utf-8');
  console.log(`📋 Loaded HTML template from ${TEMPLATE_PATH}\n`);

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Generate pages
  let successCount = 0;
  let errorCount = 0;
  const sitemapUrls = [];

  for (const pageConfig of seoData) {
    try {
      console.log(`Generating: ${pageConfig.url}`);
      const result = generatePage(pageConfig, template);

      if (result) {
        successCount++;
        sitemapUrls.push({
          url: pageConfig.url,
          priority: pageConfig.priority || 0.5,
          changefreq: 'monthly',
        });
      }
    } catch (error) {
      console.error(`❌ Error generating ${pageConfig.url}:`, error.message);
      errorCount++;
    }
  }

  // Generate sitemap
  console.log(`\n📍 Generating sitemap.xml...`);
  generateSitemap(sitemapUrls);

  // Summary
  console.log(`\n✅ Generation complete!`);
  console.log(`   Success: ${successCount} pages`);
  console.log(`   Errors:  ${errorCount} pages`);
  console.log(`   Output:  ${OUTPUT_DIR}`);
  console.log(`   Sitemap: ${SITEMAP_PATH}\n`);
}

/**
 * Generate a single page
 */
function generatePage(pageConfig, template) {
  const { url, currentTire, newTire, gearRatio, vehicleType, intendedUse } = pageConfig;

  // Parse tires
  let currentParsed = null;
  let newParsed = null;

  try {
    if (currentTire) {
      currentParsed = parseTireSize(currentTire);
    }
    if (newTire) {
      newParsed = parseTireSize(newTire);
    }
  } catch (error) {
    throw new Error(`Failed to parse tire sizes: ${error.message}`);
  }

  // Run calculation if we have both tires
  let comparison = null;
  if (currentParsed && newParsed) {
    const drivetrain = gearRatio ? {
      axleGearRatio: parseFloat(gearRatio),
      transmissionTopGear: 1.0,
      transferCaseRatio: 1.0,
      transferCaseLowRatio: 2.5,
      firstGearRatio: 4.0,
    } : {};

    comparison = calculateTireComparison(
      currentParsed,
      newParsed,
      drivetrain,
      {},
      intendedUse || 'weekend_trail'
    );
  }

  // Generate content
  const content = generatePageContent({
    currentTire,
    newTire,
    gearRatio,
    vehicleType,
    intendedUse: intendedUse || 'weekend_trail',
    comparison,
    url,
  });

  // Inject content into template
  let html = template;
  const canonicalUrl = `https://overlandn.com/tires${url}`;

  // Replace all occurrences of placeholders (not just first)
  html = html.replace(/{{TITLE}}/g, content.title);
  html = html.replace(/{{META_DESCRIPTION}}/g, content.metaDescription);
  html = html.replace(/{{H1}}/g, content.h1);
  html = html.replace('{{INTRO}}', markdownToHtml(content.intro));
  html = html.replace('{{COMPARISON_BLOCK}}', markdownToHtml(content.comparisonBlock));
  html = html.replace('{{GEAR_IMPACT_BLOCK}}', markdownToHtml(content.gearImpactBlock));
  html = html.replace('{{ADVISORY_BLOCK}}', markdownToHtml(content.advisoryBlock));
  html = html.replace('{{INTERNAL_LINKS}}', markdownToHtml(content.internalLinks));
  html = html.replace('{{STRUCTURED_DATA}}', content.structuredData);
  html = html.replace(/{{CANONICAL_URL}}/g, canonicalUrl);

  // Inject calculator prefill data
  const prefillData = JSON.stringify({
    currentTire: currentTire || '',
    newTire: newTire || '',
    gearRatio: gearRatio || '',
    vehicleType: vehicleType || '',
  });
  html = html.replace('{{PREFILL_DATA}}', prefillData);

  // Write file
  const fileName = url === '/' ? 'index.html' : `${url.slice(1)}.html`;
  const filePath = path.join(OUTPUT_DIR, fileName);

  // Ensure directory exists for nested paths
  const fileDir = path.dirname(filePath);
  if (!fs.existsSync(fileDir)) {
    fs.mkdirSync(fileDir, { recursive: true });
  }

  fs.writeFileSync(filePath, html, 'utf-8');
  return true;
}

/**
 * Basic markdown to HTML conversion
 * Handles: ##, **, -, lists
 */
function markdownToHtml(markdown) {
  if (!markdown) return '';

  let html = markdown;

  // Headers
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

  // Bold
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

  // Lists
  html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');

  // Links [text](url)
  html = html.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>');

  // Paragraphs (double newline)
  html = html.split('\n\n').map(p => {
    p = p.trim();
    if (p.startsWith('<h') || p.startsWith('<ul') || p.startsWith('<li')) {
      return p;
    }
    return `<p>${p}</p>`;
  }).join('\n');

  return html;
}

/**
 * Generate sitemap.xml
 */
function generateSitemap(urls) {
  const baseUrl = 'https://overlandn.com/tires';
  const today = new Date().toISOString().split('T')[0];

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  // Homepage
  xml += '  <url>\n';
  xml += `    <loc>${baseUrl}/</loc>\n`;
  xml += `    <lastmod>${today}</lastmod>\n`;
  xml += '    <changefreq>weekly</changefreq>\n';
  xml += '    <priority>1.0</priority>\n';
  xml += '  </url>\n';

  // Generated pages
  urls.forEach(({ url, priority, changefreq }) => {
    xml += '  <url>\n';
    xml += `    <loc>${baseUrl}${url}</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += `    <changefreq>${changefreq}</changefreq>\n`;
    xml += `    <priority>${priority}</priority>\n`;
    xml += '  </url>\n';
  });

  xml += '</urlset>';

  fs.writeFileSync(SITEMAP_PATH, xml, 'utf-8');
  console.log(`✅ Sitemap generated with ${urls.length + 1} URLs`);
}

// Run main
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
