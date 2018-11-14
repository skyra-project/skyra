class Jackpot {

	constructor(client) {
		this.client = client;
	}

	async add(id, amount) {

		const index = this.client.settings.jackpot.findIndex(user => user.id === id);
		
		const element = { id, amount: index === -1 ? amount : this.client.settings.jackpot[index].amount + amount };
		await this.client.settings.update('jackpot', element, { arrayPosition: index === -1 ? null : index });
		return element;
	}

	async draw() {
		if (this.client.settings.jackpot.length === 0) return { id: null, amount: 0 };

		const amount = this.client.settings.jackpot.reduce((a, b) => a + b.amount, 0);
		const user = this.client.settings.jackpot[Math.floor(Math.random() * this.client.settings.jackpot)].id;
		await this.client.settings.reset('jackpot');
		return { user, amount };
	}

}

module.exports = Jackpot;
