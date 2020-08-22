import { Events } from '@lib/types/Enums';
import { APIErrors } from '@utils/constants';
import { sleep } from '@utils/sleep';
import { Message, MessageExtendablesAskOptions, MessageOptions, Permissions, TextChannel } from 'discord.js';
import { Extendable, ExtendableStore } from 'klasa';

export default class extends Extendable {
	public constructor(store: ExtendableStore, file: string[], directory: string) {
		super(store, file, directory, { appliesTo: [Message] });
	}

	public async prompt(this: Message, content: string, time = 30000) {
		const message = await this.channel.send(content);
		const responses = await this.channel.awaitMessages((msg) => msg.author === this.author, { time, max: 1 });
		message.nuke().catch((error) => this.client.emit(Events.ApiError, error));
		if (responses.size === 0) throw this.language.get('messagePromptTimeout');
		return responses.first();
	}

	public async ask(this: Message, options: MessageOptions, promptOptions?: MessageExtendablesAskOptions): Promise<boolean>;
	public async ask(
		this: Message,
		content: string | MessageOptions | null,
		options?: MessageOptions | MessageExtendablesAskOptions,
		promptOptions?: MessageExtendablesAskOptions
	): Promise<boolean> {
		if (typeof content !== 'string') {
			options = content!;
			content = null;
		}
		const message = await this.send(content, options as MessageOptions);
		return this.reactable ? awaitReaction(this, message, promptOptions) : awaitMessage(this, promptOptions);
	}

	public async alert(this: Message, content: string, timer?: number): Promise<Message | null>;
	public async alert(this: Message, content: string, options?: MessageOptions, timer?: number): Promise<Message | null>;
	public async alert(this: Message, content: string, options?: number | MessageOptions, timer?: number): Promise<Message | null> {
		if (!this.channel.postable) return Promise.resolve(null);
		if (typeof options === 'number' && typeof timer === 'undefined') {
			timer = options;
			options = undefined;
		}

		const msg = (await this.sendMessage(content, options as MessageOptions)) as Message;
		msg.nuke(typeof timer === 'number' ? timer : 10000).catch((error) => this.client.emit(Events.ApiError, error));
		return msg;
	}

	public async nuke(this: Message, time = 0) {
		if (time === 0) return nuke(this);

		const count = this.edits.length;
		await sleep(time);
		return !this.deleted && this.edits.length === count ? nuke(this) : this;
	}
}

const OPTIONS = { time: 30000, max: 1 };
const REACTIONS = { YES: '🇾', NO: '🇳' };
const REG_ACCEPT = /^y|yes?|yeah?$/i;

async function awaitReaction(message: Message, messageSent: Message, promptOptions: MessageExtendablesAskOptions = OPTIONS) {
	await messageSent.react(REACTIONS.YES);
	await messageSent.react(REACTIONS.NO);
	const reactions = await messageSent.awaitReactions((__, user) => user === message.author, promptOptions);

	// Remove all reactions if the user has permissions to do so
	if (message.guild && (message.channel as TextChannel).permissionsFor(message.guild.me!)!.has(Permissions.FLAGS.MANAGE_MESSAGES)) {
		messageSent.reactions.removeAll().catch((error) => messageSent.client.emit(Events.ApiError, error));
	}

	return Boolean(reactions.size) && reactions.firstKey() === REACTIONS.YES;
}

async function awaitMessage(message: Message, promptOptions: MessageExtendablesAskOptions = OPTIONS) {
	const messages = await message.channel.awaitMessages((mes) => mes.author === message.author, promptOptions);
	return Boolean(messages.size) && REG_ACCEPT.test(messages.first()!.content);
}

async function nuke(message: Message) {
	try {
		return await message.delete();
	} catch (error) {
		if (error.code === APIErrors.UnknownMessage) return message;
		throw error;
	}
}
