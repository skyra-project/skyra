const { Task, config } = require('../index');
const request = require('snekfetch');

module.exports = class extends Task {

	run() {
		if (this.client.options.dev) return;

		/* eslint-disable camelcase */
		if (config.tokens.discordBotOrg) {
			request
				.post(`https://discordbots.org/api/bots/${this.client.user.id}/stats`)
				.set('Authorization', config.tokens.discordBotOrg)
				.send({ server_count: this.client.guilds.size })
				.then(() => this.client.emit('verbose', `POST [discordbots.org]: ${this.client.guilds.size}`))
				.catch(err => this.client.emit('error', `ERROR [discordbots.org]:\nError: ${(err && err.stack) || err}`));
		}
		if (config.tokens.discordBots) {
			request
				.post(`https://bots.discord.pw/api/bots/${this.client.user.id}/stats`)
				.set('Authorization', config.tokens.discordBots)
				.send({ server_count: this.client.guilds.size })
				.then(() => this.client.emit('verbose', `POST [bots.discord.pw]: ${this.client.guilds.size}`))
				.catch(err => this.client.emit('error', `ERROR [bots.discord.pw]:\nError: ${(err && err.stack) || err}`));
		}
		if (config.tokens.botsForDiscord) {
			request
				.post(`https://botsfordiscord.com/api/v1/bots/${this.client.user.id}`)
				.set('Authorization', config.tokens.botsForDiscord)
				.send({ server_count: this.client.guilds.size })
				.then(() => this.client.emit('verbose', `POST [bots.discord.pw]: ${this.client.guilds.size}`))
				.catch(err => this.client.emit('error', `ERROR [bots.discord.pw]:\nError: ${(err && err.stack) || err}`));
		}
		// if (config.tokens.serverHound) request
		// 	.post('https://bots.discordlist.net/api')
		// 	.set('content-type', 'application/x-www-form-urlencoded')
		// 	.send({ token: config.tokens.serverHound, servers: this.client.guilds.size })
		// 	.then(() => this.client.emit('log', `POST [ServerHound]: ${this.client.guilds.size}`))
		// 	.catch(err => this.client.emit('error', `ERROR [ServerHound]:\nError: ${(err && err.stack) || err}`));
		/* eslint-enable camelcase */
	}

};
