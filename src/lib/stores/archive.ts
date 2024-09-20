import { writable } from 'svelte/store';

export const selectedItemStore = writable<string | null>(null);
