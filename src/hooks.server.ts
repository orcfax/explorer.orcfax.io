import 'dotenv/config';
import PocketBase from 'pocketbase';
import { env } from '$env/dynamic/public';
import { logError } from '$lib/server/logger';
import type { Handle, HandleServerError } from '@sveltejs/kit';

export const handleError: HandleServerError = async ({ error, status, message }) => {
	logError(message, `Status: ${status} - ${error}`);

	// Return a user-friendly error response
	return {
		message: 'An unexpected error occurred'
	};
};

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.pb = new PocketBase(env.PUBLIC_DB_HOST);
	const response = await resolve(event);
	response.headers.set('X-Frame-Options', 'SAMEORIGIN');
	response.headers.set('Content-Security-Policy', "frame-ancestors 'none'");

	return response;
};
