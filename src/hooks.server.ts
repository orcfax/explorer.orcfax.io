import { logError } from '$lib/server/logger';
import type { HandleServerError } from '@sveltejs/kit';

export const handleError: HandleServerError = async ({ error, status, message }) => {
	logError(message, `Status: ${status} - ${error}`);

	// Return a user-friendly error response
	return {
		message: 'An unexpected error occurred'
	};
};
