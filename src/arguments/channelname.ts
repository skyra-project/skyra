import { Snowflake } from 'discord.js';
import { KlasaGuildChannel, Possible } from 'klasa';
import { Argument, FuzzySearch } from '../index';
import { SkyraGuild, SkyraMessage } from '../lib/types/klasa';
const CHANNEL_REGEXP: RegExp = /^(?:<#)?(\d{17,19})>?$/;

export default class extends Argument {

	public get channel(): Argument {
		// @ts-ignore
		return this.store.get('channel');
	}

	// @ts-ignore
	public async run(arg: string, possible: Possible, msg: SkyraMessage, filter: (entry: KlasaGuildChannel) => boolean): Promise<KlasaGuildChannel> {
		if (!arg) throw msg.language.get('RESOLVER_INVALID_CHANNELNAME', possible.name);
		if (!msg.guild) return this.channel.run(arg, possible, msg) as Promise<KlasaGuildChannel>;
		const resChannel: KlasaGuildChannel | null = this.resolveChannel(arg, msg.guild);
		if (resChannel) return resChannel;

		const result: [Snowflake, KlasaGuildChannel] | null = await new FuzzySearch(msg.guild.channels, (entry: KlasaGuildChannel) => entry.name, filter).run(msg, arg);
		if (result) return result[1];
		throw msg.language.get('RESOLVER_INVALID_CHANNELNAME', possible.name);
	}

	public resolveChannel(query: string, guild: SkyraGuild): KlasaGuildChannel | null {
		return (CHANNEL_REGEXP.test(query) && <KlasaGuildChannel | undefined> guild.channels.get((<RegExpExecArray> CHANNEL_REGEXP.exec(query))[1])) || null;
	}

}
