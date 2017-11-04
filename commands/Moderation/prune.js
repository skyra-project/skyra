const { Command } = require('../../index');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			guildOnly: true,
			name: 'prune',
			permLevel: 2,
			botPerms: ['MANAGE_MESSAGES'],
			runIn: ['text'],
			cooldown: 5,

			description: 'Prunes a certain amount of messages w/o filter.',
			usage: '[limit:integer] [link|invite|bots|you|me|upload|user:user]',
			usageDelim: ' ',
			extend: {
				EXPLANATION: [
					'This command deletes the given amount of messages given a filter within the last 100 messages sent',
					'in the channel the command got run.'
				].join(' '),
				ARGUMENTS: '[messages] [filter]',
				EXP_USAGE: [
					['Messages', 'The amount of messages to prune.'],
					['Filter', 'The filter to apply.'],
					['(Filter) Link', 'Filters messages that have links on the content.'],
					['(Filter) Invite', 'Filters messages that have invite links on the content.'],
					['(Filter) Bots', 'Filters messages sent by bots.'],
					['(Filter) You', 'Filters messages sent by Skyra.'],
					['(Filter) Me', 'Filters your messages.'],
					['(Filter) Upload', 'Filters messages that have attachments.'],
					['(Filter) User', 'Filters messages sent by the specified user.']
				],
				EXAMPLES: [
					'50 me',
					'75 @kyra',
					'20 bots'
				]
			}
		});
	}

	async run(msg, [limit = 50, filter], settings, i18n) {
		let messages = await msg.channel.messages.fetch({ limit: 100 });
		if (typeof filter !== 'undefined') {
			const user = typeof filter !== 'string' ? filter : null;
			const type = typeof filter === 'string' ? filter : 'user';
			messages = messages.filter(this.getFilter(msg, type, user));
		}
		messages = messages.array().slice(0, limit);
		await msg.channel.bulkDelete(messages, true);
		return msg.send(i18n.get('COMMAND_PRUNE', messages.length, limit));
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
