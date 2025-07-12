import winston from 'winston';
import { webcrypto as crypto } from 'node:crypto';
import { env as privateEnv } from '$env/dynamic/private';
import { env as publicEnv } from '$env/dynamic/public';

// Create logger instance
const logger = winston.createLogger({
	level: 'error',
	format: winston.format.combine(
		winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
		winston.format.printf(({ timestamp, level, message }) => {
			return `${timestamp} [${level.toUpperCase()}]: ${message}`;
		})
	),
	transports: [new winston.transports.Console()]
});

export async function logError(message: string, error?: unknown) {
	// Generate a unique error ID for tracking
	const errorId = crypto.randomUUID();

	// Format the error message
	let formattedError = '';
	if (error instanceof Error) {
		formattedError = error.stack || error.message;
	} else if (typeof error === 'string') {
		formattedError = error;
	} else if (error) {
		formattedError = JSON.stringify(error, null, 2);
	}

	// Construct the log message
	const logMessage = `ID: ${errorId} - \nContent: ${message}${formattedError ? `: ${formattedError}` : ''}`;

	// Log the message using Winston
	logger.error(logMessage);

	// Get environment variables safely
	const DISCORD_WEBHOOK_URL = privateEnv.PRIVATE_DISCORD_WEBHOOK_URL;
	const NODE_ENV = publicEnv.PUBLIC_NODE_ENV;

	// Send the log message to Discord in production or test environments
	if (DISCORD_WEBHOOK_URL && (NODE_ENV === 'production' || NODE_ENV === 'test')) {
		await sendMessageToDiscord(logMessage, DISCORD_WEBHOOK_URL, NODE_ENV);
	}
}

async function sendMessageToDiscord(message: string, webhookUrl: string, nodeEnv: string) {
	try {
		const res = await fetch(webhookUrl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				content: `(${nodeEnv.toUpperCase()}) Explorer Error: ${message}`
			})
		});

		if (!res.ok) {
			throw new Error(`Failed to send error to Discord webhook: ${res.statusText}`);
		}
	} catch (error) {
		logger.error(`Failed to send error to Discord webhook: ${error}`);
	}
}
