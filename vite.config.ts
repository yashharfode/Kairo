import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { execSync } from 'node:child_process';

/**
 * Dev-only auth plugin — resolves the current Lemma access token from the CLI
 * and seeds it into localStorage *before* the app bundle runs.
 *
 * This means `npm run dev` is always logged in as whoever `lemma auth login`
 * last ran for. The token is resolved live on every page load (so it picks up
 * CLI refreshes), is never written to a file, and — because the plugin only
 * applies during `serve` — never runs in `vite build`, so it never ships in
 * a deployed bundle.
 */
function lemmaDevAuth(env: Record<string, string>): Plugin {
  const command = env.VITE_LEMMA_DEV_TOKEN_CMD ?? 'lemma auth print-token';
  return {
    name: 'lemma-dev-auth',
    apply: 'serve',
    transformIndexHtml() {
      if (!command.trim()) return;
      let token = '';
      try {
        token = execSync(command, {
          encoding: 'utf8',
          stdio: ['ignore', 'pipe', 'ignore'],
        }).trim();
      } catch {
        // Not logged in / CLI unavailable — leave unauthenticated so the
        // app's normal auth redirect still applies.
        console.warn('[lemma-dev-auth] Could not get token from CLI. Run: lemma auth login');
        return;
      }
      if (!token) return;
      return [
        {
          tag: 'script',
          injectTo: 'head-prepend',
          children: `try{localStorage.setItem("lemma_token",${JSON.stringify(token)})}catch(e){}`,
        },
      ];
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  // Proxy: forwards /api/* to https://api.lemma.work/* — eliminates CORS in dev.
  // Set LEMMA_DEV_PROXY_TARGET in .env.local to enable.
  const proxyTarget = env.LEMMA_DEV_PROXY_TARGET;
  const server = proxyTarget
    ? {
        proxy: {
          '/api': {
            target: proxyTarget,
            changeOrigin: true,
            secure: false,
            rewrite: (path: string) => path.replace(/^\/api/, ''),
          },
        },
      }
    : undefined;

  return {
    plugins: [react(), lemmaDevAuth(env)],
    server,
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
      // Prevent duplicate React instances when SDK has its own node_modules
      dedupe: ['react', 'react-dom'],
    },
  };
});
