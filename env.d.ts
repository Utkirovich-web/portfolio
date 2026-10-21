/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Public production URL without trailing slash, e.g. https://shohjahon.dev */
  readonly VITE_SITE_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
