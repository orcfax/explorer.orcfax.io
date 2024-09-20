import { isUUID } from '$lib/client/helpers';
import type { ParamMatcher } from '@sveltejs/kit';

export const match = ((param) => {
	return isUUID(param);
}) satisfies ParamMatcher;
