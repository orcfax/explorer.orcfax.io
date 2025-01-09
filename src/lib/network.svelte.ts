export class Network {
	#network = $state(0);

	// create property accessors
	get network() {
		return this.#network;
	}
	set network(value) {
		this.#network = value;
	}
}
