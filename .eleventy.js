import 'dotenv/config';
import { eleventyImageTransformPlugin } from '@11ty/eleventy-img';

export default function (eleventyConfig) {
  // Optimise raster <img> at build: emit AVIF/WebP/fallback with responsive
  // widths. Per-image attributes already in the markup (the hero's eager
  // loading and fetchpriority) are preserved; only missing ones are filled.
  eleventyConfig.addPlugin(eleventyImageTransformPlugin, {
    extensions: 'html',
    formats: ['avif', 'webp', 'auto'],
    widths: [480, 960, 'auto'],
    defaultAttributes: {
      loading: 'lazy',
      decoding: 'async',
      sizes: '(min-width: 60rem) 40rem, 90vw',
    },
  });

  // Passthrough copy: assets, well-known, redirects/headers
  eleventyConfig.addPassthroughCopy({ 'src/assets': 'assets' });
  eleventyConfig.addPassthroughCopy('src/.well-known');
  eleventyConfig.addPassthroughCopy({ '_headers': '_headers' });
  eleventyConfig.addPassthroughCopy({ '_redirects': '_redirects' });
  eleventyConfig.addPassthroughCopy('src/robots.txt');

  // Watch CSS/JS for dev reload
  eleventyConfig.addWatchTarget('src/assets/');

  eleventyConfig.addFilter('date', (value, format = '%Y-%m-%d') => {
    const d = value === 'now' ? new Date() : new Date(value);
    if (isNaN(d.getTime())) return '';
    const pad = n => String(n).padStart(2, '0');
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return format
      .replace('%Y', d.getUTCFullYear())
      .replace('%m', pad(d.getUTCMonth() + 1))
      .replace('%-d', d.getUTCDate())
      .replace('%d', pad(d.getUTCDate()))
      .replace('%b', months[d.getUTCMonth()]);
  });

  return {
    dir: {
      input: 'src',
      includes: '_includes',
      data: '_data',
      output: '_site',
    },
    templateFormats: ['njk', 'md', 'html'],
    htmlTemplateEngine: 'njk',
    markdownTemplateEngine: 'njk',
  };
}
