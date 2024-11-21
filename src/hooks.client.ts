import type { HandleClientError } from '@sveltejs/kit';

//TODO probably not a good idea for production, might want to better handle errors
export const handleError: HandleClientError = async ({ error, event }) => {
	console.error('Error:', error, event);
	return {
		message: JSON.stringify(error)
	};
};
