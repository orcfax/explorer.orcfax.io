import { readable, derived } from 'svelte/store';
import { formatDistanceStrict, parseISO } from 'date-fns';

export const time = readable(new Date(), (set) => {
	const interval = setInterval(() => {
		set(new Date());
	}, 1000);

	return () => {
		clearInterval(interval);
	};
});

interface TimeSinceOptions {
	includeSeconds?: boolean;
	addSuffix?: boolean;
}

export function createTimeSinceStore(timestamp: string | Date, options?: TimeSinceOptions) {
	const date = typeof timestamp === 'string' ? parseISO(timestamp) : timestamp;
	return derived(time, ($time) =>
		formatDistanceStrict(date, $time, {
			addSuffix: options?.addSuffix ?? true
		})
	);
}
