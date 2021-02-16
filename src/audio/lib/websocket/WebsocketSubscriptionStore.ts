export class WebsocketSubscriptionStore<T extends { id: string }> {
	// eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
	#subscriptions: T[] = [];

	public subscribed(id: string) {
		return this.#subscriptions.some((sub) => sub.id === id);
	}

	public subscribe(entry: T) {
		if (this.subscribed(entry.id)) return false;

		this.#subscriptions.push(entry);
		return true;
	}

	public unsubscribe(id: string) {
		const index = this.#subscriptions.findIndex((sub) => sub.id === id);
		if (index === -1) return false;

		this.#subscriptions.splice(index, 1);
		return true;
	}
}
