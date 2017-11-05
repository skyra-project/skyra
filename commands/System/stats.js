const { structures: { Command } } = require('../../index');
const { version } = require('discord.js');
const { uptime, loadavg } = require('os');
const moment = require('moment');
require('moment-duration-format');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['stats', 'sts'],
			mode: 2,
			cooldown: 15,

			description: 'Provides some details about the bot and stats.'
		});
	}

	async run(msg, params, settings, i18n) {
		return msg.send(i18n.get('COMMAND_STATS', this.STATS, this.UPTIME, this.USAGE), { code: 'asciidoc' });
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
		return {
			HOST: moment.duration(uptime() * 1000).format('d[ days], h[:]mm[:]ss'),
			TOTAL: moment.duration(process.uptime() * 1000).format('d[ days], h[:]mm[:]ss'),
			CLIENT: moment.duration(this.client.uptime).format('d[ days], h[:]mm[:]ss')
		};
	}

	get USAGE() {
		return {
			CPU_LOAD: `${Math.round(loadavg()[0] * 10000) / 100}%`,
			RAM_TOTAL: `${Math.round(100 * (process.memoryUsage().heapTotal / 1048576)) / 100}MB`,
			RAM_USED: `${Math.round(100 * (process.memoryUsage().heapUsed / 1048576)) / 100}MB`
		};
	}

};
