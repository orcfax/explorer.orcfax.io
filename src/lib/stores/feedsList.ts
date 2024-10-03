import { writable } from 'svelte/store';
import type { DBFeedWithData } from '$lib/types';

export const feedsListStore = writable<Promise<DBFeedWithData[]>>();
