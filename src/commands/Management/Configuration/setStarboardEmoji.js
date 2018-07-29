const { Command, util: { resolveEmoji } } = require('../../../index');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			bucket: 2,
			cooldown: 10,
			description: (msg) => msg.language.get('COMMAND_SETSTARBOARDEMOJI_DESCRIPTION'),
			extendedHelp: (msg) => msg.language.get('COMMAND_SETSTARBOARDEMOJI_EXTENDED'),
			permissionLevel: 6,
			runIn: ['text'],
			usage: '<Emoji:emoji>'
		});

		this.createCustomResolver('emoji', async (arg, possible, msg) => {
			const resolved = resolveEmoji(arg);
			if (resolved) return resolved;
			throw msg.language.get('RESOLVER_INVALID_EMOJI', possible.name);
		});
	}

	async run(msg, [emoji]) {
		if (msg.guild.configs.starboard.emoji === emoji) throw msg.language.get('CONFIGURATION_EQUALS');
		await msg.guild.configs.update('starboard.emoji', emoji);
		return msg.sendLocale('COMMAND_SETSTARBOARDEMOJI_SET', [emoji.includes(':') ? `<${emoji}>` : emoji]);
	}

};
