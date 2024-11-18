// import { derived } from 'svelte/store';
// import { page } from '$app/stores';
// import { goto } from '$app/navigation';
//
// TODO: enable url store archive nav
// export const selectedItemStore = derived(page, ($page) => {
// 	const params = new URLSearchParams($page.url.search);
// 	return parseInt(params.get('archive') || '0');
// });
// export function updateSelectedItem(currentUrl: URL, fileIndex: number | undefined) {
// 	const url = new URL(currentUrl);
// 	const newIndex = fileIndex === undefined ? '0' : fileIndex.toString();
// 	url.searchParams.set('archive', newIndex);
// 	goto(url, { replaceState: true, noScroll: true, keepFocus: true });
// }

import { writable } from 'svelte/store';

export const selectedItemStore = writable<string | null>(null);
