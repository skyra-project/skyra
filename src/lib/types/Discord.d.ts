import type {
	APIMessage,
	DMChannel,
	Guild,
	GuildMember,
	MessageAdditions,
	MessageOptions,
	NewsChannel,
	PartialSendAliases,
	SplitOptions,
	StringResolvable,
	TextChannel
} from 'discord.js';
import type { KlasaMessage } from 'klasa';

export interface GuildMessage extends KlasaMessage {
	channel: TextChannel | NewsChannel;
	readonly guild: Guild;
	readonly member: GuildMember;
}

export interface DMMessage extends KlasaMessage {
	channel: DMChannel;
	readonly guild: null;
	readonly member: null;
}

export interface MessageAcknowledgeable extends PartialSendAliases {
	readonly guild: Guild;
	send(content?: StringResolvable, options?: MessageOptions | MessageAdditions): Promise<KlasaMessage>;
	// eslint-disable-next-line @typescript-eslint/unified-signatures
	send(content?: StringResolvable, options?: (MessageOptions & { split?: false }) | MessageAdditions): Promise<KlasaMessage>;
	send(content?: StringResolvable, options?: (MessageOptions & { split: true | SplitOptions }) | MessageAdditions): Promise<KlasaMessage[]>;
	send(options?: MessageOptions | MessageAdditions | APIMessage): Promise<KlasaMessage>;
	// eslint-disable-next-line @typescript-eslint/unified-signatures
	send(options?: (MessageOptions & { split?: false }) | MessageAdditions | APIMessage): Promise<KlasaMessage>;
	send(options?: (MessageOptions & { split: true | SplitOptions }) | MessageAdditions | APIMessage): Promise<KlasaMessage[]>;
}
