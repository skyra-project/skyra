import { GuildChannel, Message, TextChannel } from 'discord.js';
import { Argument, Possible } from 'klasa';

export default class extends Argument {
	public get channelname(): Argument {
		return this.store.get('channelname')!;
	}

	public run(arg: string, possible: Possible, message: Message): Promise<TextChannel> {
		return this.channelname.run(arg, possible, message, (entry: GuildChannel) => entry.type === 'text');
	}
}
