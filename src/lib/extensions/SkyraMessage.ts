/* eslint-disable @typescript-eslint/class-literal-property-style */
import { Events } from '#lib/types/Enums';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { sleep } from '#utils/sleep';
import { RESTJSONErrorCodes } from 'discord-api-types/v6';
import { Message, MessageExtendablesAskOptions, MessageOptions, Permissions, Structures, TextChannel } from 'discord.js';
import { TextBasedExtension, TextBasedExtensions } from './base/TextBasedExtension';

const OPTIONS = { time: 30000, max: 1 };
const REACTIONS = { YES: '🇾', NO: '🇳' };
const REG_ACCEPT = /^y|yes?|yeah?$/i;

export class SkyraMessage extends TextBasedExtension(Structures.get('Message')) {
	public async fetchLanguage() {
		const lang: string = await this.client.fetchLanguage(this);
		return lang ?? this.guild?.preferredLocale ?? this.client.i18n.options?.defaultName ?? 'en-US';
	}

	public async prompt(content: string, time = 30000) {
		const message = await this.channel.send(content);
		const responses = await this.channel.awaitMessages((msg) => msg.author === this.author, { time, max: 1 });
		message.nuke().catch((error) => this.client.emit(Events.ApiError, error));
		if (responses.size === 0) throw await this.resolveKey(LanguageKeys.Misc.MessagePromptTimeout);
		return responses.first()!;
	}

	public ask(options: MessageOptions, promptOptions?: MessageExtendablesAskOptions): Promise<boolean>;
	public ask(
		content: string | MessageOptions | null,
		options?: MessageOptions | MessageExtendablesAskOptions,
		promptOptions?: MessageExtendablesAskOptions
	): Promise<boolean>;

	public async ask(
		content: string | MessageOptions | null,
		options?: MessageOptions | MessageExtendablesAskOptions,
		promptOptions?: MessageExtendablesAskOptions
	): Promise<boolean> {
		if (typeof content !== 'string') {
			options = content!;
			content = null;
		}
		const message = (await this.send(content, options as MessageOptions)) as Message;
		return this.reactable ? awaitReaction(this, message, promptOptions) : awaitMessage(this, promptOptions);
	}

	public async alert(content: string, timer?: number): Promise<Message>;
	public async alert(content: string, options?: MessageOptions, timer?: number): Promise<Message>;
	public async alert(content: string, options?: number | MessageOptions, timer?: number): Promise<Message> {
		if (typeof options === 'number' && typeof timer === 'undefined') {
			timer = options;
			options = undefined;
		}

		const msg = (await this.send(content, options as MessageOptions)) as Message;
		msg.nuke(typeof timer === 'number' ? timer : 10000).catch((error) => this.client.emit(Events.ApiError, error));
		return msg;
	}

	public async nuke(time = 0): Promise<Message> {
		if (time === 0) return this.nukeNow();

		const lastEditedTimestamp = this.editedTimestamp;
		await sleep(time);
		return !this.deleted && this.editedTimestamp === lastEditedTimestamp ? this.nukeNow() : (this as Message);
	}

	private async nukeNow() {
		try {
			return await this.delete();
		} catch (error) {
			if (error.code === RESTJSONErrorCodes.UnknownMessage) return this as Message;
			throw error;
		}
	}
}

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

declare module 'discord.js' {
	interface MessageExtendablesAskOptions {
		time?: number;
		max?: number;
	}

	interface Message extends TextBasedExtensions {
		fetchLanguage(): Promise<string>;
		prompt(content: string, time?: number): Promise<Message>;
		ask(content: string, options?: MessageOptions, promptOptions?: MessageExtendablesAskOptions): Promise<boolean>;
		ask(options?: MessageOptions, promptOptions?: MessageExtendablesAskOptions): Promise<boolean>;
		alert(content: string, timer?: number): Promise<Message>;
		alert(content: string, options?: number | MessageOptions, timer?: number): Promise<Message>;
		nuke(time?: number): Promise<Message>;
	}
}

Structures.extend('Message', () => SkyraMessage);
