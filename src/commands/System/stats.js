const { Command, Duration } = require('klasa');
const { version } = require('discord.js');
const { uptime, loadavg } = require('os');

module.exports = class extends Command {

	constructor(client, store, file, directory) {
		super(client, store, file, directory, {
			aliases: ['stats', 'sts'],
			bucket: 2,
			cooldown: 15,
			description: (language) => language.get('COMMAND_STATS_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_STATS_EXTENDED')
		});
	}

	async run(msg) {
		return msg.sendLocale('COMMAND_STATS', [this.STATS, this.UPTIME, this.USAGE], { code: 'asciidoc' });
	}

	get STATS() {
		return {
			USERS: this.client.guilds.reduce((a, b) => a + b.memberCount, 0).toLocaleString(),
			GUILDS: this.client.guilds.size.toLocaleString(),
			CHANNELS: this.client.channels.size.toLocaleString(),
			VERSION: `v${version}`,
			NODE_JS: process.version
		};
	}

	get UPTIME() {
		const now = Date.now();
		return {
			HOST: Duration.toNow(now - (uptime() * 1000), false),
			TOTAL: Duration.toNow(now - (process.uptime() * 1000), false),
			CLIENT: Duration.toNow(now - this.client.uptime, false)
		};
	}

	get USAGE() {
		return {
			CPU_LOAD: `${Math.round(loadavg()[0] * 100) / 100}%`,
			RAM_TOTAL: `${Math.round(100 * (process.memoryUsage().heapTotal / 1048576)) / 100}MB`,
			RAM_USED: `${Math.round(100 * (process.memoryUsage().heapUsed / 1048576)) / 100}MB`
		};
	}

};
