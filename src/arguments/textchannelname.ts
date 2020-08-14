import { GuildChannel, TextChannel } from 'discord.js';
import { Argument, KlasaMessage, Possible } from 'klasa';

export default class extends Argument {
	public get channelname(): Argument {
		return this.store.get('channelname')!;
	}

	public run(arg: string, possible: Possible, message: KlasaMessage): Promise<TextChannel> {
		return this.channelname.run(arg, possible, message, (entry: GuildChannel) => entry.type === 'text');
	}
}
