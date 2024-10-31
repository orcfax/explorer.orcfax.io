import { isUUID } from '$lib/client/helpers';
import type { ParamMatcher } from '@sveltejs/kit';

export const match = ((param) => {
	return isUUID(param) || param === 'undefined';
}) satisfies ParamMatcher;
