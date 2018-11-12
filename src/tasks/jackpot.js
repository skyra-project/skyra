const { Task } = require('klasa');

module.exports = class extends Task {

	async run() {
		const { id, amount } = await this.client.jackpot.draw();
		if (id === null) return;

		const user = await this.client.users.fetch(id).catch(() => null);
		if (user === null) return;

		await user.settings.update('money', user.settings.money + amount);
		user.sendLocale('COMMAND_JACKPOT_USER_WIN', [amount]).catch(() => null);
	}

};
