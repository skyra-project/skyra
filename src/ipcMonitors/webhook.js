const { IPCMonitor } = require('../index');

module.exports = class extends IPCMonitor {

	async run(data) {
		if (data.bot !== this.client.user.id) throw 'BAD';
		const user = await this.client.users.fetch(data.user);
		const settings = await user.settings.sync();

		const payment = data.votes && (data.votes.totalVotes % 5 === 0) ? 2000 : 500;
		const { errors } = await settings.update('money', settings.money + payment);
		if (errors.length) throw String(errors[0]);
		return 'OK';
	}

};
