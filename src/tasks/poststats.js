const { Task, config, util: { fetch } } = require('../index');

module.exports = class extends Task {

	run() {
		if (this.client.options.dev) return;

		/* eslint-disable camelcase */
		if (config.tokens.discordBotOrg) {
			fetch(`https://discordbots.org/api/bots/${this.client.user.id}/stats`, {
				headers: { Authorization: config.tokens.discordBotOrg },
				body: { server_count: this.client.guilds.size },
				method: 'POST'
			}, 'result')
				.then(() => this.client.emit('verbose', `POST [discordbots.org]: ${this.client.guilds.size}`))
				.catch(err => this.client.emit('error', `ERROR [discordbots.org]:\nError: ${(err && err.stack) || err}`));
		}
		if (config.tokens.discordBots) {
			fetch(`https://bots.discord.pw/api/bots/${this.client.user.id}/stats`, {
				headers: { Authorization: config.tokens.discordBots },
				body: { server_count: this.client.guilds.size },
				method: 'POST'
			}, 'result')
				.then(() => this.client.emit('verbose', `POST [bots.discord.pw]: ${this.client.guilds.size}`))
				.catch(err => this.client.emit('error', `ERROR [bots.discord.pw]:\nError: ${(err && err.stack) || err}`));
		}
		if (config.tokens.botsForDiscord) {
			fetch(`https://botsfordiscord.com/api/v1/bots/${this.client.user.id}`, {
				headers: { Authorization: config.tokens.botsForDiscord },
				body: { server_count: this.client.guilds.size },
				method: 'POST'
			}, 'result')
				.then(() => this.client.emit('verbose', `POST [botsfordiscord.com]: ${this.client.guilds.size}`))
				.catch(err => this.client.emit('error', `ERROR [botsfordiscord.com]:\nError: ${(err && err.stack) || err}`));
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
