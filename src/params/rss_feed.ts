import type { ParamMatcher } from '@sveltejs/kit';

export const match = ((param) => {
	return /^(rss\.xml|atom\.xml|rss\.json)$/.test(param);
}) satisfies ParamMatcher;
