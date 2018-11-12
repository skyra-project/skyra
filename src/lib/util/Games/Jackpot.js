class Jackpot {

	constructor(client) {
		this.client = client;
	}

	async add(id, amount) {
		const object = this.client.jackpot.find(user => user.id === id);
		const index = this.client.jackpot.findIndex(user => user.id === id);

		// eslint-disable-next-line curly
		if (object !== null) {
			await this.client.settings.update('jackpot', { id, amount: object.amount + amount }, { index });
		} else await this.client.settings.update('jackpot', { id, amount });
		return this.client.settings.jackpot.find(jackpotUser => jackpotUser.id === id).amount;
	}

	async draw() {
		if (this.client.settings.jackpot.length === 0) return { id: null, amount: 0 };

		// eslint-disable-next-line
        const amount = this.client.settings.jackpot.reduce((a, b) => a + b.amount, 0);

		const user = this.client.settings.jackpot[Math.floor(Math.random() * this.client.settings.jackpot)].id;

		await this.client.settings.reset('jackpot');

		return { user, amount };
	}

}

module.exports = Jackpot;
