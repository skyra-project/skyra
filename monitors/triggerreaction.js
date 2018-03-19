const { Monitor } = require('../index');
const { Permissions: { FLAGS } } = require('discord.js');

module.exports = class extends Monitor {

	constructor(...args) {
		super(...args, {
			ignoreBots: true,
			ignoreSelf: true
		});
	}

	async run(msg) {
		if (!msg.guild || !msg.guild.configs.trigger.length) return;
		const trigger = msg.guild.configs.trigger.find(trg => msg.content.includes(trg.input));
		if (trigger) {
			switch (trigger.action) {
				case 'react': if (msg.channel.permissionsFor(msg.guild.me).has(FLAGS.ADD_REACTIONS)) await msg.react(trigger.data);
					break;
			}
		}
	}

};
