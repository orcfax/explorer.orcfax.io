import 'dotenv/config';
import PocketBase from 'pocketbase';
import { env } from '$env/dynamic/public';
import { logError } from '$lib/server/logger';
import type { Handle, HandleServerError } from '@sveltejs/kit';

export const handleError: HandleServerError = async ({ error, status, message }) => {
	// Only send server errors (5xx) to Discord — 404s are expected
	// behavior (scanner probes, mistyped URLs, etc.), not incidents
	if (status >= 500) {
		logError(message, `Status: ${status} - ${error}`);
	}

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
