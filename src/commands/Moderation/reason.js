const { Command, constants: { MODERATION: { SCHEMA_KEYS } }, util: { parseRange } } = require('../../index');

module.exports = class extends Command {

	constructor(client, store, file, directory) {
		super(client, store, file, directory, {
			requiredPermissions: ['EMBED_LINKS'],
			cooldown: 5,
			description: (language) => language.get('COMMAND_REASON_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_REASON_EXTENDED'),
			permissionLevel: 5,
			runIn: ['text'],
			usage: '(cases:case) <reason:...string>',
			usageDelim: ' '
		});

		this.createCustomResolver('case', async (arg, possible, message) => {
			if (!arg) throw message.language.get('COMMAND_REASON_MISSING_CASE');
			if (arg.toLowerCase() === 'latest') return [await message.guild.moderation.count()];
			return parseRange(arg);
		});
	}

	async run(msg, [cases, reason]) {
		if (!reason) reason = null;

		const modlogs = await msg.guild.moderation.fetch(cases);
		if (!modlogs.size) throw msg.language.get('COMMAND_REASON_NOT_EXISTS', cases.length > 1);

		const channel = msg.guild.channels.get(msg.guild.settings.channels.modlog);
		const messages = channel ? await channel.messages.fetch({ limit: 100 }) : null;

		const promises = [];
		for (const modlog of modlogs.values())
			// Update the moderation case
			promises.push(this._updateReason(channel, messages, modlog, reason));

		await Promise.all(promises);

		if (!channel) msg.guild.settings.reset('channels.modlog').catch((error) => this.client.emit('wtf', error));
		return msg.alert(msg.language.get('COMMAND_REASON_UPDATED', modlogs.map(modlog => modlog.case), reason));
	}

	async _updateReason(channel, messages, modlog, reason) {
		await modlog.edit({ [SCHEMA_KEYS.REASON]: reason });

		if (channel) {
			const message = messages.find(mes => mes.author.id === this.client.user.id
				&& mes.embeds.length > 0
				&& mes.embeds[0].type === 'rich'
				&& mes.embeds[0].footer && mes.embeds[0].footer.text === `Case ${modlog.case}`
			);

			const embed = await modlog.prepareEmbed();
			if (message) await message.edit(embed);
			else await channel.send(embed);
		}
	}

};
