import { Message } from 'discord.js';
import { Argument, Possible } from 'klasa'
const CHANNEL_REGEXP = /^(?:<#)?(\d{17,19})>?$/;

export default class extends Argument {

	public get channel(): Argument {
		return <unknown> this.store.get('channel') as Argument;
	}

	public async run(arg: string, possible: Possible, message: Message, filter?: (entry: string) => boolean) {
		if (!arg) throw message.language.get('RESOLVER_INVALID_CHANNELNAME', possible.name);
		if (!message.guild) return this.channel.run(arg, possible, message);
		const resChannel = this.resolveChannel(arg, message.guild);
		if (resChannel) return resChannel;

		const result = await new FuzzySearch(message.guild.channels, (entry) => entry.name, filter).run(message, arg);
		if (result) return result[1];
		throw message.language.get('RESOLVER_INVALID_CHANNELNAME', possible.name);
	}

	public resolveChannel(query, guild) {
		if (CHANNEL_REGEXP.test(query)) return guild.channels.get(CHANNEL_REGEXP.exec(query)[1]);
		return null;
	}

}
