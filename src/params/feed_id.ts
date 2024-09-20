import type { ParamMatcher } from '@sveltejs/kit';

export const match = ((param) => {
	return /^[a-zA-Z]{3}\/[a-zA-Z]+-[a-zA-Z]+(\/\d+)?$/.test(param);
}) satisfies ParamMatcher;
