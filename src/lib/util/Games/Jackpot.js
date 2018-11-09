class Jackpot {

	constructor(client) {
		this.client = client;
		this.users = [];
	}

	async add(id, amount) {
		this.users.push({ id, amount });
		if (await this.client.providers.default.has('jackpot', id)) await this.client.providers.default.update('jackpot', id, { amount });
		else await this.client.providers.default.create('jackpot', id, { amount });
		return this.users.find(jackpotUser => jackpotUser.id === id).amount;
	}

	async draw() {
		if (this.users.length === 0) return null;
		// eslint-disable-next-line curly
		for (const user of this.users) {
			await this.client.providers.default.delete('jackpot', user.id);
		}


		// eslint-disable-next-line
        const amount = this.users.reduce((a, b) => { a.amount += b.amount; });

		const user = this.users[Math.floor(Math.random() * this.users.length)].id;

		this.users = [];
		this.time = 0;

		return { user, amount };
	}

	async init() {
		this.data = await this.client.providers.default.getAll('jackpot');
	}

}

module.exports = Jackpot;
