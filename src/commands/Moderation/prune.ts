import { User, Message } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';
import { SkyraCommand } from '../../lib/structures/SkyraCommand';

export default class extends SkyraCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['purge', 'nuke'],
			cooldown: 5,
			description: language => language.tget('COMMAND_PRUNE_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_PRUNE_EXTENDED'),
			permissionLevel: 5,
			requiredPermissions: ['MANAGE_MESSAGES', 'READ_MESSAGE_HISTORY'],
			runIn: ['text'],
			usage: '[limit:integer] [link|invite|bots|you|me|upload|user:user]',
			usageDelim: ' '
		});
	}

	public async run(message: KlasaMessage, [limit = 50, filter]: [number, string]) {
		let messages = await message.channel.messages.fetch({ limit: 100, before: message.id });
		if (typeof filter !== 'undefined') {
			const user = typeof filter === 'string' ? null : filter;
			const type = typeof filter === 'string' ? filter : 'user';
			messages = messages.filter(this.getFilter(message, type, user));
		}
		const now = Date.now();
		const filtered = [...messages.filter(m => now - m.createdTimestamp < 1209600000).keys()].slice(0, limit);

		if (filtered.length) await message.channel.bulkDelete(filtered);
		return message.sendLocale('COMMAND_PRUNE', [filtered.length, limit]);
	}

	public getFilter(message: Message, filter: string, user: User | null) {
		switch (filter) {
			case 'links':
			case 'link': return (mes: Message) => /https?:\/\/[^ /.]+\.[^ /.]+/.test(mes.content);
			case 'invites':
			case 'invite': return (mes: Message) => /(https?:\/\/)?(www\.)?(discord\.(gg|li|me|io)|discordapp\.com\/invite)\/\w+/.test(mes.content);
			case 'bots':
			case 'bot': return (mes: Message) => mes.author!.bot;
			case 'you': return (mes: Message) => mes.author!.id === this.client.user!.id;
			case 'me': return (mes: Message) => mes.author!.id === message.author!.id;
			case 'uploads':
			case 'upload': return (mes: Message) => mes.attachments.size > 0;
			case 'humans':
			case 'human':
			case 'user': return (mes: Message) => mes.author!.id === user!.id;
			default: return () => true;
		}
	}

}
