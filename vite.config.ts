/**
 * Vite-конфигурация Open WebUI (submodule) с thin hook для pilot custom-ui.
 *
 * Alias @bing/custom-ui подключает project-owned слой frontend/custom-ui
 * без копирования кода в vendor-дерево (ADR 0002).
 *
 * Локализация RU/EN: thin hook в src/lib/i18n/index.ts (alias $lib/i18n не подменяется).
 *
 * Используется при сборке pilot-образа: frontend/Dockerfile.pilot
 *
 * @see frontend/patches/README.md
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

import { viteStaticCopy } from 'vite-plugin-static-copy';

const projectRoot = path.dirname(fileURLToPath(import.meta.url));
// Sibling-каталог custom-ui относительно submodule open-webui
const customUiRoot = path.resolve(projectRoot, '../custom-ui');

export default defineConfig({
	resolve: {
		alias: {
			// Импорты вида @bing/custom-ui/... резолвятся в frontend/custom-ui
			'@bing/custom-ui': customUiRoot
		}
	},
	plugins: [
		sveltekit(),
		viteStaticCopy({
			targets: [
				{
					src: 'node_modules/onnxruntime-web/dist/*.jsep.*',

					dest: 'wasm'
				}
			]
		})
	],
	define: {
		APP_VERSION: JSON.stringify(process.env.npm_package_version),
		// Передаётся из Dockerfile.pilot (BUILD_HASH) для cache bust
		APP_BUILD_HASH: JSON.stringify(process.env.APP_BUILD_HASH || 'dev-build')
	},
	build: {
		sourcemap: true
	},
	worker: {
		format: 'es'
	},
	esbuild: {
		pure: process.env.ENV === 'dev' ? [] : ['console.log', 'console.debug', 'console.error']
	}
});
