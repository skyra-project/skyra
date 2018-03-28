const { Command } = require('../../index');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			botPerms: ['MANAGE_MESSAGES'],
			cooldown: 5,
			description: msg => msg.language.get('COMMAND_PRUNE_DESCRIPTION'),
			extendedHelp: msg => msg.language.get('COMMAND_PRUNE_EXTENDED'),
			name: 'prune',
			permLevel: 5,
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
		await msg.channel.bulkDelete(messages, true);
		return msg.sendMessage(msg.language.get('COMMAND_PRUNE', messages.length, limit));
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
