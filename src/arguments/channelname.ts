import { Argument, FuzzySearch, Possible, Snowflake } from '../index';
import { SkyraGuildChannel, SkyraGuildChannelStore } from '../lib/types/discord.js';
import { Argument as ArgumentType, SkyraGuild, SkyraMessage } from '../lib/types/klasa';
const CHANNEL_REGEXP: RegExp = /^(?:<#)?(\d{17,19})>?$/;

export default class extends Argument {

	public get channel(): ArgumentType {
		// @ts-ignore
		return this.store.get('channel');
	}

	// @ts-ignore
	public async run(arg: string, possible: Possible, msg: SkyraMessage, filter: (entry: SkyraGuildChannel) => boolean): Promise<SkyraGuildChannel> {
		if (!arg) throw msg.language.get('RESOLVER_INVALID_CHANNELNAME', possible.name);
		if (!msg.guild) return this.channel.run(arg, possible, msg) as Promise<SkyraGuildChannel>;
		const resChannel: SkyraGuildChannel | null = this.resolveChannel(arg, msg.guild);
		if (resChannel) return resChannel;

		const result: [Snowflake, SkyraGuildChannel] | null = await new FuzzySearch<Snowflake, SkyraGuildChannel, SkyraGuildChannelStore>(msg.guild.channels, (entry: SkyraGuildChannel) => entry.name, filter).run(msg, arg);
		if (result) return result[1];
		throw msg.language.get('RESOLVER_INVALID_CHANNELNAME', possible.name);
	}

	public resolveChannel(query: string, guild: SkyraGuild): SkyraGuildChannel | null {
		return (CHANNEL_REGEXP.test(query) && <SkyraGuildChannel | undefined> guild.channels.get((<RegExpExecArray> CHANNEL_REGEXP.exec(query))[1])) || null;
	}

}
