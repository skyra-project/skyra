const { Task } = require('klasa');

module.exports = class extends Task {

	async run() {
		const draw = await this.client.jackpot.draw();
		if (draw === null) return;

		const { id, amount } = draw;
		const user = await this.client.users.fetch(id);
		if (user === null) return;
		user.settings.update('money', user.settings.money + amount);
		user.send(`Hey! You just won the jackpot for: ${amount}!`).catch(() => null);
	}

};
