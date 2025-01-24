import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),

	kit: {
		adapter: adapter({
			pages: 'build',
			assets: 'build',
			fallback: 'index.html',
			precompress: false,
			strict: true
		}),
		paths: {
			base: process.env.NODE_ENV === 'production' ? '/cc-svelte' : '',
			relative: false
		},
		prerender: {
			handleHttpError: ({ path, referrer, message }) => {
				if (message.includes('Not Found')) {
					return;
				}
				throw new Error(message);
			}
		}
	}
};

export default config;