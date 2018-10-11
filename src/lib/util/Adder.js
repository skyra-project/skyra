class Adder extends Array {

	constructor(maximum, duration) {
		super();

		this.maximum = maximum;
		this.duration = duration;
	}

	add(id, times = 1) {
		this.sweep();
		const amount = this.count(id) + times;
		if (amount > this.maximum) {
			this.remove(id);
			throw new Error('Limit Reached');
		}

		for (let i = 0; i < times; i++)	this.push({ id, end: Date.now() + this.duration });
		return amount;
	}

	remove(id) {
		let deleted = 0;
		let i = 0;
		let entry;

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

	count(id) {
		return this.reduce((count, entry) => entry.id === id ? count + 1 : count, 0);
	}

	sweep() {
		const now = Date.now();
		let i = 0;
		while (i < this.length && this[i].end <= now) i++;
		if (i !== 0) this.splice(0, i);

		return i;
	}

}

module.exports = Adder;
