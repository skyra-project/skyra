const { Task, config } = require('../index');
const request = require('snekfetch');

module.exports = class extends Task {

	async run() {
		/* eslint-disable camelcase */
		if (config.tokens.discordBotOrg) request
			.post(`https://discordbots.org/api/bots/${this.client.user.id}/stats`)
			.set('Authorization', config.tokens.discordBotOrg)
			.send({ server_count: this.client.guilds.size })
			.then(() => this.client.emit('verbose', `POST [discordbots.org]: ${this.client.guilds.size}`))
			.catch(err => this.client.emit('error', `ERROR [discordbots.org]:\nError: ${(err && err.stack) || err}`));
		/* eslint-enable camelcase */
	}

};
