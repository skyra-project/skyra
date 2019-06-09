export class Adder<T> extends Array<{ id: T; end: number }> {

	/**
	 * The maximum amount of entries in this instance
	 */
	public maximum: number;

	/**
	 * The duration for each entry in this instance
	 */
	public duration: number;

	public constructor(maximum: number, duration: number) {
		super();
		this.maximum = maximum;
		this.duration = duration;
	}

	public add(id: T, times: number = 1) {
		this.sweep();
		const amount = this.count(id) + times;
		if (amount > this.maximum) {
			this.remove(id);
			throw new Error('Limit Reached');
		}

		for (let i = 0; i < times; i++)	this.push({ id, end: Date.now() + this.duration });
		return amount;
	}

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

	public count(id: T) {
		return this.reduce<number>((count, entry) => entry.id === id ? count + 1 : count, 0);
	}

	public sweep() {
		const now = Date.now();
		let i = 0;
		while (i < this.length && this[i].end <= now) i++;
		if (i !== 0) this.splice(0, i);

		return i;
	}

}
