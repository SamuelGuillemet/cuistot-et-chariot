/// <reference types="vite/client" />

interface ViteTypeOptions {
  // By adding this line, you can make the type of ImportMetaEnv strict
  // to disallow unknown keys.
  strictImportMetaEnv: true;
}

interface ImportMetaEnv {
  readonly VITE_CONVEX_URL: string;
  readonly VITE_CONVEX_SITE_URL: string;
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
