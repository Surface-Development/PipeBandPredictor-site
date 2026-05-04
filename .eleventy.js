import 'dotenv/config';

export default function (eleventyConfig) {
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
