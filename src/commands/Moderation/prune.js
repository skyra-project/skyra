const { Command, MessageEmbed, ModerationLog: { TYPES: { prune: { title, color } } } } = require('../../index');
const URL = 'https://skyradiscord.com/#/gist';

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			requiredPermissions: ['MANAGE_MESSAGES', 'READ_MESSAGE_HISTORY'],
			cooldown: 5,
			description: (language) => language.get('COMMAND_PRUNE_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_PRUNE_EXTENDED'),
			permissionLevel: 5,
			runIn: ['text'],
			usage: '[limit:integer] [link|invite|bots|you|me|upload|user:user]',
			usageDelim: ' '
		});
	}

	async run(msg, [limit = 50, filter]) {
		let messages = await msg.channel.messages.fetch({ limit: 100, before: msg.id });
		if (typeof filter !== 'undefined') {
			const user = typeof filter !== 'string' ? filter : null;
			const type = typeof filter === 'string' ? filter : 'user';
			messages = messages.filter(this.getFilter(msg, type, user));
		}
		messages = messages.array().slice(0, limit);
		this.sendLog(msg, filter, messages).catch(error => this.client.emit('apiError', error));
		await msg.channel.bulkDelete(messages, true);
		return msg.sendLocale('COMMAND_PRUNE', [messages.length, limit]);
	}

	async sendLog(msg, filter, messages) {
		const { channels, events } = msg.guild.configs;
		if (!channels.modlog || !events.messagePrune) return;
		const channel = msg.guild.channels.get(channels.modlog);
		if (!channel || !channel.postable) {
			await msg.guild.configs.reset('channels.modlog');
			return;
		}

		const formatted = [];
		for (const m of messages) {
			formatted.push({
				id: m.id,
				author: m.author.tag,
				attachments: m.attachments.map(this._resizeImage),
				embeds: m.embeds.filter(embed => embed.type === 'image').map(embed => this._resizeImage(embed.thumbnail)),
				createdTimestamp: m.createdTimestamp,
				cleanContent: m.cleanContent
			});
		}

		const { filename, key } = await this.client.ipc.send('dashboard', { route: 'cryptoSave', type: 'MESSAGE_GIST', text: formatted.reverse() });
		await channel.send(new MessageEmbed()
			.setAuthor(msg.author.tag, msg.author.displayAvatarURL())
			.setDescription([
				`❯ **Type**: ${title}`,
				`❯ **URL**: [${key}](${URL}?id=${filename}&key=${key})`,
				`❯ **Filter**: ${filter || 'all'}`,
				`❯ **Amount**: ${messages.length}`
			].join('\n'))
			.setColor(color));
	}

	_resizeImage(image) {
		let { height, width } = image;
		if (Math.max(400, height, width) > 400) {
			let factor = 1;
			if (height > width) factor = 400 / height;
			else factor = 400 / width;

			height *= factor;
			width *= factor;
		}

		return { url: image.url, height, width };
	}

	getFilter(msg, filter, user) {
		switch (filter) {
			case 'link': return mes => /https?:\/\/[^ /.]+\.[^ /.]+/.test(mes.content);
			case 'invite': return mes => /(https?:\/\/)?(www\.)?(discord\.(gg|li|me|io)|discordapp\.com\/invite)\/.+/.test(mes.content);
			case 'bots': return mes => mes.author.bot;
			case 'you': return mes => mes.author.id === this.client.user.id;
			case 'me': return mes => mes.author.id === msg.author.id;
			case 'upload': return mes => mes.attachments.size > 0;
			case 'user': return mes => mes.author.id === user.id;
			default: return () => true;
		}
	}

};
