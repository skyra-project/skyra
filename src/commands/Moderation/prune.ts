const { Command } = require('../../index');

module.exports = class extends Command {

	constructor(client, store, file, directory) {
		super(client, store, file, directory, {
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
		const now = Date.now();
		messages = [...messages.filter(message => now - message.createdTimestamp < 1209600000).keys()].slice(0, limit);

		if (messages.length) await msg.channel.bulkDelete(messages);
		return msg.sendLocale('COMMAND_PRUNE', [messages.length, limit]);
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
			case 'links':
			case 'link': return mes => /https?:\/\/[^ /.]+\.[^ /.]+/.test(mes.content);
			case 'invites':
			case 'invite': return mes => /(https?:\/\/)?(www\.)?(discord\.(gg|li|me|io)|discordapp\.com\/invite)\/.+/.test(mes.content);
			case 'bots':
			case 'bot': return mes => mes.author.bot;
			case 'you': return mes => mes.author.id === this.client.user.id;
			case 'me': return mes => mes.author.id === msg.author.id;
			case 'uploads':
			case 'upload': return mes => mes.attachments.size > 0;
			case 'humans':
			case 'human':
			case 'user': return mes => mes.author.id === user.id;
			default: return () => true;
		}
	}

};
