const { Command, Moderation: { schemaKeys }, util: { parseModlog }, klasaUtil: { codeBlock } } = require('../../index');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			botPerms: ['EMBED_LINKS'],
			cooldown: 5,
			description: msg => msg.language.get('COMMAND_REASON_DESCRIPTION'),
			extendedHelp: msg => msg.language.get('COMMAND_REASON_EXTENDED'),
			name: 'reason',
			permLevel: 5,
			runIn: ['text'],
			usage: '<case:integer> <reason:string> [...]',
			usageDelim: ' '
		});
	}

	async run(msg, [selected, ...reason]) {
		reason = reason.length > 0 ? reason.join(' ') : null;

		if (!msg.guild.configs.channels.modlog) throw msg.language.get('GUILD_SETTINGS_CHANNELS_MOD');
		const channel = msg.guild.channels.get(msg.guild.configs.channels.modlog);
		if (!channel) {
			await msg.guild.configs.reset('channels.mod');
			throw msg.language.get('GUILD_SETTINGS_CHANNELS_MOD');
		}

		// Get all cases
		const modlog = await this.client.moderation.getCase(msg.guild.id, selected);
		if (!modlog) throw msg.language.get('COMMAND_REASON_NOT_EXISTS');

		// Update the moderation case
		const newModLog = {
			...modlog,
			[schemaKeys.REASON]: reason,
			[schemaKeys.MODERATOR]: msg.author.id
		};
		await this.client.moderation.updateCase(msg.guild, newModLog);

		// Fetch the message to edit it
		const messages = await channel.messages.fetch({ limit: 100 });
		const message = messages.find(mes => mes.author.id === this.client.user.id
			&& mes.embeds.length > 0
			&& mes.embeds[0].type === 'rich'
			&& mes.embeds[0].footer && mes.embeds[0].footer.text === `Case ${selected}`
		);

		// Change the moderator to the author
		const parsedModLog = await parseModlog(this.client, msg.guild, newModLog);

		if (message) await message.edit({ embed: parsedModLog.embed });
		else channel.send({ embed: parsedModLog.embed });

		return msg.alert(`Successfully updated the log ${selected}.${codeBlock('http', [
			`Old reason : ${modlog.reason || 'Not set.'}`,
			`New reason : ${reason}`
		].join('\n'))}`);
	}

};
