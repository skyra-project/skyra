import { LanguageKeys } from '#lib/i18n/languageKeys';
import { Events } from '#lib/types/Enums';
import { sleep } from '#utils/Promisified/sleep';
import { isGuildBasedChannel } from '@sapphire/discord.js-utilities';
import { I18nextChannelImplementation, I18nextImplemented, I18nextMessageImplementation } from '@sapphire/plugin-i18next';
import { Time } from '@sapphire/time-utilities';
import { RESTJSONErrorCodes } from 'discord-api-types/v6';
import {
	Message,
	MessageAdditions,
	MessageExtendablesAskOptions,
	MessageOptions,
	Permissions,
	SplitOptions,
	Structures,
	TextChannel
} from 'discord.js';

const OPTIONS = { time: 30000, max: 1 };
const REACTIONS = { YES: '🇾', NO: '🇳' };
const REG_ACCEPT = /^y|yes?|yeah?$/i;
const kReactablePermissions = new Permissions(['VIEW_CHANNEL', 'ADD_REACTIONS', 'READ_MESSAGE_HISTORY']);

export class SkyraMessage extends I18nextImplemented(Structures.get('Message')) {
	public async fetchLanguage(): Promise<string> {
		return this._fetchLanguage(this.guild, this.channel, this.author);
	}

	public sendTranslated(
		key: string,
		values?: readonly unknown[],
		options?: MessageOptions | (MessageOptions & { split?: false }) | MessageAdditions
	): Promise<Message>;

	public sendTranslated(key: string, values?: readonly unknown[], options?: MessageOptions & { split: true | SplitOptions }): Promise<Message[]>;
	public sendTranslated(key: string, options?: MessageOptions | (MessageOptions & { split?: false }) | MessageAdditions): Promise<Message>;
	public sendTranslated(key: string, options?: MessageOptions & { split: true | SplitOptions }): Promise<Message[]>;
	public async sendTranslated(
		key: string,
		valuesOrOptions?: readonly unknown[] | MessageOptions | MessageAdditions,
		rawOptions?: MessageOptions
	): Promise<Message | Message[]> {
		const [values, options]: [readonly unknown[], MessageOptions] =
			valuesOrOptions === undefined || Array.isArray(valuesOrOptions)
				? [valuesOrOptions ?? [], rawOptions ?? {}]
				: [[], valuesOrOptions as MessageOptions];
		return this.send(await this.resolveKey(key, ...values), options);
	}

	public get reactable() {
		return isGuildBasedChannel(this.channel) ? this.channel.permissionsFor(this.guild!.me!)!.has(kReactablePermissions, false) : true;
	}

	public async prompt(content: string, time = 30000) {
		const message = await this.channel.send(content);
		const responses = await this.channel.awaitMessages((msg) => msg.author === this.author, { time, max: 1 });
		message.nuke().catch((error) => this.client.emit(Events.ApiError, error));
		if (responses.size === 0) throw await this.resolveKey(LanguageKeys.Misc.MessagePromptTimeout);
		return responses.first()!;
	}

	public ask(options: MessageOptions, promptOptions?: MessageExtendablesAskOptions): Promise<boolean | null>;
	public ask(
		content: string | MessageOptions | null,
		options?: MessageOptions | MessageExtendablesAskOptions,
		promptOptions?: MessageExtendablesAskOptions
	): Promise<boolean | null>;

	public async ask(
		content: string | MessageOptions | null,
		options?: MessageOptions | MessageExtendablesAskOptions,
		promptOptions?: MessageExtendablesAskOptions
	): Promise<boolean | null> {
		if (typeof content !== 'string') {
			options = content!;
			content = null;
		}
		const message = (await this.send(content, options as MessageOptions)) as Message;
		return message.reactable ? awaitReaction(this, message, promptOptions) : awaitMessage(this, promptOptions);
	}

	public async alert(content: string, timer?: number): Promise<Message>;
	public async alert(content: string, options?: MessageOptions, timer?: number): Promise<Message>;
	public async alert(content: string, options?: number | MessageOptions, timer?: number): Promise<Message> {
		if (typeof options === 'number' && typeof timer === 'undefined') {
			timer = options;
			options = undefined;
		}

		const msg = (await this.send(content, options as MessageOptions)) as Message;
		msg.nuke(typeof timer === 'number' ? timer : Time.Minute).catch((error) => this.client.emit(Events.ApiError, error));
		return msg;
	}

	public async nuke(time = 0): Promise<Message> {
		if (this.deleted) return this;
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

async function awaitReaction(message: Message, messageSent: Message, promptOptions?: MessageExtendablesAskOptions) {
	promptOptions = { ...OPTIONS, ...promptOptions };
	await messageSent.react(REACTIONS.YES);
	await messageSent.react(REACTIONS.NO);

	const target = promptOptions.target ?? message.author;
	const reactions = await messageSent.awaitReactions((__, user) => user.id === target.id, promptOptions);

	// Remove all reactions if the user has permissions to do so
	if (message.guild && (message.channel as TextChannel).permissionsFor(message.guild.me!)!.has(Permissions.FLAGS.MANAGE_MESSAGES)) {
		messageSent.reactions.removeAll().catch((error) => messageSent.client.emit(Events.ApiError, error));
	}

	return reactions.size === 0 ? null : reactions.firstKey() === REACTIONS.YES;
}

async function awaitMessage(message: Message, promptOptions: MessageExtendablesAskOptions = OPTIONS) {
	const target = promptOptions.target ?? message.author;
	const messages = await message.channel.awaitMessages((mes) => mes.author === target, promptOptions);
	return messages.size === 0 ? null : REG_ACCEPT.test(messages.first()!.content);
}

declare module 'discord.js' {
	export interface MessageExtendablesAskOptions {
		time?: number;
		max?: number;
		target?: User;
	}

	export interface Message extends I18nextMessageImplementation, I18nextChannelImplementation {
		reactable: boolean;
		fetchLanguage(): Promise<string>;
		prompt(content: string, time?: number): Promise<Message>;
		ask(content: string, options?: MessageOptions, promptOptions?: MessageExtendablesAskOptions): Promise<boolean | null>;
		ask(options?: MessageOptions, promptOptions?: MessageExtendablesAskOptions): Promise<boolean | null>;
		alert(content: string, timer?: number): Promise<Message>;
		alert(content: string, options?: number | MessageOptions, timer?: number): Promise<Message>;
		nuke(time?: number): Promise<Message>;
	}
}

Structures.extend('Message', () => SkyraMessage);
