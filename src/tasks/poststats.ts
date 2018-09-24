const { Task, config, util: { fetch } } = require('../index');

module.exports = class extends Task {

	async run() {
		if (this.client.options.dev) return;

		const guilds = this.client.guilds.size;
		const users = this.client.guilds.reduce((a, b) => a + b.memberCount, 0);
		const body = `{"server_count":${guilds}}`;
		if (config.tokens.discordBotOrg) {
			fetch(`https://discordbots.org/api/bots/${this.client.user.id}/stats`, {
				headers: { 'Content-Type': 'application/json', Authorization: config.tokens.discordBotOrg },
				method: 'POST',
				body
			}, 'result')
				.then(() => this.client.emit('verbose', `POST [discordbots.org]: ${guilds}`))
				.catch(err => this.client.emit('error', `ERROR [discordbots.org]:\nError: ${(err && err.stack) || err}`));
		}
		if (config.tokens.discordBots) {
			fetch(`https://bots.discord.pw/api/bots/${this.client.user.id}/stats`, {
				headers: { 'Content-Type': 'application/json', Authorization: config.tokens.discordBots },
				method: 'POST',
				body
			}, 'result')
				.then(() => this.client.emit('verbose', `POST [bots.discord.pw]: ${guilds}`))
				.catch(err => this.client.emit('error', `ERROR [bots.discord.pw]:\nError: ${(err && err.stack) || err}`));
		}
		if (config.tokens.botsForDiscord) {
			fetch(`https://botsfordiscord.com/api/v1/bots/${this.client.user.id}`, {
				headers: { 'Content-Type': 'application/json', Authorization: config.tokens.botsForDiscord },
				method: 'POST',
				body
			}, 'result')
				.then(() => this.client.emit('verbose', `POST [botsfordiscord.com]: ${guilds}`))
				.catch(err => this.client.emit('error', `ERROR [botsfordiscord.com]:\nError: ${(err && err.stack) || err}`));
		}
		if (config.tokens.discordBotList) {
			fetch(`https://discordbotlist.com/api/bots/${this.client.user.id}/stats`, {
				headers: { 'Content-Type': 'application/json', Authorization: `Bot ${config.tokens.discordBotList}` },
				method: 'POST',
				body: `{"guilds":${guilds},"users":${users}}`
			}, 'result')
				.then(() => this.client.emit('verbose', `POST [discordbotlist.com]: ${guilds} | ${users}`))
				.catch(err => this.client.emit('error', `ERROR [discordbotlist.com]:\nError: ${(err && err.stack) || err}`));
		}
		// if (config.tokens.serverHound) request
		// 	.post('https://bots.discordlist.net/api')
		// 	.set('content-type', 'application/x-www-form-urlencoded')
		// 	.send({ token: config.tokens.serverHound, servers: this.client.guilds.size })
		// 	.then(() => this.client.emit('log', `POST [ServerHound]: ${this.client.guilds.size}`))
		// 	.catch(err => this.client.emit('error', `ERROR [ServerHound]:\nError: ${(err && err.stack) || err}`));
	}

};
