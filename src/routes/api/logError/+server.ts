import { json } from '@sveltejs/kit';
import { logError } from '$lib/server/logger';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	const { message, error } = await request.json();
	if (!message) return json({ error: 'Message not found' });

	await logError(message, error);

	return json({ message, error });
};
