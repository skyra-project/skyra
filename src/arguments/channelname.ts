import { FuzzySearch } from '@utils/FuzzySearch';
import { validateChannelAccess } from '@utils/util';
import { GuildChannel, User } from 'discord.js';
import { Argument, KlasaGuild, KlasaMessage, Possible } from 'klasa';

const CHANNEL_REGEXP = Argument.regex.channel;

export default class extends Argument {
	public get channel() {
		return this.store.get('channel')!;
	}

	public resolveChannel(query: string, guild: KlasaGuild) {
		const channelID = CHANNEL_REGEXP.exec(query);
		return (channelID !== null && guild.channels.cache.get(channelID[1])) ?? null;
	}

	public async run(arg: string, possible: Possible, message: KlasaMessage, filter?: (entry: GuildChannel) => boolean): Promise<GuildChannel> {
		if (!arg) throw message.language.get('resolverInvalidChannelName', { name: possible.name });
		if (!message.guild) throw message.language.get('resolverChannelNotInGuild');
		filter = this.getFilter(message.author, filter);

		const resChannel = this.resolveChannel(arg, message.guild);
		if (resChannel && filter(resChannel)) return resChannel;

		const result = await new FuzzySearch(message.guild.channels.cache, (entry) => entry.name, filter).run(
			message,
			arg,
			possible.min || undefined
		);
		if (result) return result[1];
		throw message.language.get('resolverInvalidChannelName', { name: possible.name });
	}

	private getFilter(author: User, filter?: (entry: GuildChannel) => boolean) {
		const clientUser = this.client.user!;
		return typeof filter === 'undefined'
			? (entry: GuildChannel) => validateChannelAccess(entry, author) && validateChannelAccess(entry, clientUser)
			: (entry: GuildChannel) => filter(entry) && validateChannelAccess(entry, author) && validateChannelAccess(entry, clientUser);
	}
}
