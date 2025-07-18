// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces

import PocketBase from 'pocketbase';
import type { Network } from '$lib/types';

declare global {
	namespace App {
		interface Locals {
			network: Network;
			pb: PocketBase;
		}
		// interface Error {}
		// interface PageData {}
		// interface Platform {}
	}
}

export {};
