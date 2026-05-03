export default function (eleventyConfig) {
  // Passthrough copy: assets, well-known, redirects/headers
  eleventyConfig.addPassthroughCopy({ 'src/assets': 'assets' });
  eleventyConfig.addPassthroughCopy('src/.well-known');
  eleventyConfig.addPassthroughCopy({ '_headers': '_headers' });
  eleventyConfig.addPassthroughCopy({ '_redirects': '_redirects' });
  eleventyConfig.addPassthroughCopy('src/robots.txt');

  // Watch CSS/JS for dev reload
  eleventyConfig.addWatchTarget('src/assets/');

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
