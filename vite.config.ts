import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite'

/**
 * Emits robots.txt and sitemap.xml at build time so they always point
 * at the real production URL (VITE_SITE_URL in .env).
 */
function seoFiles(siteUrl: string): Plugin {
  const url = siteUrl.replace(/\/$/, '')
  return {
    name: 'portfolio:seo-files',
    apply: 'build',
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'robots.txt',
        source: `User-agent: *\nAllow: /\n\nSitemap: ${url}/sitemap.xml\n`,
      })
      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source: [
          '<?xml version="1.0" encoding="UTF-8"?>',
          '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
          `  <url><loc>${url}/</loc><lastmod>${new Date().toISOString().slice(0, 10)}</lastmod><priority>1.0</priority></url>`,
          '</urlset>',
          '',
        ].join('\n'),
      })
    },
  }
}

/**
 * Preloads the Latin subsets of the two variable fonts so text is laid out with the
 * final fonts on first render (no late swap / relayout). Hashed file names are only
 * known after bundling, so the <link rel="preload"> tags are injected at build time.
 */
function preloadFonts(patterns: RegExp[]): Plugin {
  let base = '/'
  return {
    name: 'portfolio:preload-fonts',
    apply: 'build',
    configResolved(config) {
      base = config.base
    },
    transformIndexHtml: {
      order: 'post',
      handler(_html, context) {
        if (!context.bundle) return
        return Object.keys(context.bundle)
          .filter((fileName) => patterns.some((pattern) => pattern.test(fileName)))
          .map((fileName) => ({
            tag: 'link',
            attrs: {
              rel: 'preload',
              href: `${base}${fileName}`,
              as: 'font',
              type: 'font/woff2',
              crossorigin: '',
            },
            injectTo: 'head' as const,
          }))
      },
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const siteUrl = env.VITE_SITE_URL || 'https://example.com'

  return {
    plugins: [
      vue(),
      // Pre-compiles src/locales/*.json so the smaller runtime-only vue-i18n build is shipped.
      VueI18nPlugin({
        include: [fileURLToPath(new URL('./src/locales/**', import.meta.url))],
        // All messages are precompiled, so the runtime message compiler can be dropped.
        dropMessageCompiler: true,
      }),
      seoFiles(siteUrl),
      preloadFonts([/inter-latin-wght-normal-.*\.woff2$/, /manrope-latin-wght-normal-.*\.woff2$/]),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@use "@/styles/mixins" as *;\n`,
        },
      },
    },
    build: {
      cssCodeSplit: true,
      sourcemap: false,
      chunkSizeWarningLimit: 600,
    },
  }
})
