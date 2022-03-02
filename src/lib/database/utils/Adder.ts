export class AdderError extends Error {
	/**
	 * The amount of points the adder reached when it threw this error.
	 */
	public readonly amount: number;

	/**
	 * Constructs an AdderError instance.
	 * @param message The message to be passed to the Error constructor
	 * @param amount The amount of points the adder reached when it threw this error
	 */
	public constructor(message: string, amount: number) {
		super(message);
		this.amount = amount;
	}
}

export class Adder<T> extends Array<{ id: T; end: number }> {
	/**
	 * The maximum amount of entries in this instance.
	 */
	public maximum: number;

	/**
	 * The duration for each entry in this instance.
	 */
	public duration: number;

	/**
	 * Whether or not the Adder should auto-remove when it reaches its maximum.
	 */
	public autoRemove: boolean;

	/**
	 * Constructs a new Adder instance.
	 * @param maximum The maximum amount of entries that can be stored, this is inclusive.
	 * @param duration The duration of which entries expire.
	 * @param autoRemove Whether or not the Adder should automatically remove when a set of items reaches its maximum.
	 */
	public constructor(maximum: number, duration: number, autoRemove = false) {
		super();
		this.maximum = maximum;
		this.duration = duration;
		this.autoRemove = autoRemove;
	}

	/**
	 * Add a new entry to the adder, throws if it reaches its maximum.
	 * @param id The element to push
	 * @param times The amount of times to push it.
	 * @returns The amount of elements with the same id after the modifications.
	 */
	public add(id: T, times = 1) {
		// Perform a sweep to remove expired elements, then count.
		this.sweep();
		const amount = this.count(id) + times;

		// Push the elements to the end.
		for (let i = 0; i < times; i++) {
			this.push({ id, end: Date.now() + this.duration });
		}

		// If maximum, throw.
		if (amount >= this.maximum) {
			if (this.autoRemove) this.remove(id);
			throw new AdderError('Limit Reached', amount);
		}

		return amount;
	}

	/**
	 * Remove all entries matching an ID.
	 * @param id The ID to remove.
	 * @returns The amount of elements removed.
	 */
	public remove(id: T) {
		let deleted = 0;
		let i = 0;
		let entry: { id: T; end: number };

		while (i < this.length) {
			entry = this[i];
			if (entry.id === id) {
				this.splice(i, 1);
				deleted++;
			} else {
				i++;
			}
		}

		return deleted;
	}

	/**
	 * Count all entries with the same ID.
	 * @param id The ID to match against.
	 * @returns The amount of entries matching the same ID.
	 */
	public count(id: T) {
		return this.reduce((count, entry) => (entry.id === id ? count + 1 : count), 0);
	}

	/**
	 * Sweep all expired entries.
	 * @returns The amount of deleted entries.
	 */
	public sweep() {
		const now = Date.now();
		let i = 0;
		while (i < this.length && this[i].end <= now) i++;
		if (i !== 0) this.splice(0, i);

		return i;
	}
}
