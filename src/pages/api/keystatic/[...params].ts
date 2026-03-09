export const prerender = false;
import { makeKeystaticAPIRoute } from '@keystatic/astro/api';
import keystaticConfig from '../../../../keystatic.config';

export const all = makeKeystaticAPIRoute(keystaticConfig);
