import type { SkyraCommand } from '#lib/structures';
import type { NonGroupMessage, TypedFT, TypedT } from '#lib/types';
import { floatPromise, minutes, resolveOnErrorCodes } from '#utils/common';
import { canReact, canRemoveAllReactions } from '@sapphire/discord.js-utilities';
import { container } from '@sapphire/framework';
import { send } from '@sapphire/plugin-editable-commands';
import { resolveKey, type TOptions } from '@sapphire/plugin-i18next';
import { RESTJSONErrorCodes, type Message, type MessageCreateOptions, type UserResolvable } from 'discord.js';
import { setTimeout as sleep } from 'node:timers/promises';

const messageCommands = new WeakMap<Message, SkyraCommand>();

/**
 * Sets or resets the tracking status of a message with a command.
 * @param message The message to track.
 * @param command The command that was run with the given message, if any.
 */
export function setCommand(message: Message, command: SkyraCommand | null) {
	if (command === null) messageCommands.delete(message);
	else messageCommands.set(message, command);
}

/**
 * Gets the tracked command from a message.
 * @param message The message to get the command from.
 * @returns The command that was run with the given message, if any.
 */
export function getCommand(message: Message): SkyraCommand | null {
	return messageCommands.get(message) ?? null;
}

async function deleteMessageImmediately(message: Message): Promise<Message> {
	return (await resolveOnErrorCodes(message.delete(), RESTJSONErrorCodes.UnknownMessage)) ?? message;
}

/**
 * Deletes a message, skipping if it was already deleted, and aborting if a non-zero timer was set and the message was
 * either deleted or edited.
 *
 * This also ignores the `UnknownMessage` error code.
 * @param message The message to delete.
 * @param time The amount of time, defaults to 0.
 * @returns The deleted message.
 */
export async function deleteMessage(message: Message, time = 0): Promise<Message> {
	if (time === 0) return deleteMessageImmediately(message);

	const lastEditedTimestamp = message.editedTimestamp;
	await sleep(time);

	// If it was deleted or edited, cancel:
	if (message.editedTimestamp !== lastEditedTimestamp) {
		return message;
	}

	return deleteMessageImmediately(message);
}

/**
 * Sends a temporary editable message and then floats a {@link deleteMessage} with the given `timer`.
 * @param message The message to reply to.
 * @param options The options to be sent to the channel.
 * @param timer The timer in which the message should be deleted, using {@link deleteMessage}.
 * @returns The response message.
 */
export async function sendTemporaryMessage(message: Message, options: string | MessageCreateOptions, timer = minutes(1)): Promise<Message> {
	if (typeof options === 'string') options = { content: options };

	const response = await send(message, options);
	floatPromise(deleteMessage(response, timer));
	return response;
}

/**
 * Send an editable localized message using `key`.
 * @param message The message to reply to.
 * @param key The key to be used when resolving.
 * @example
 * ```typescript
 * await sendLocalizedMessage(message, LanguageKeys.Commands.General.Ping);
 * // ➡ "Pinging..."
 * ```
 */
export function sendLocalizedMessage(message: Message, key: LocalizedSimpleKey): Promise<Message>;
/**
 * Send an editable localized message using an object.
 * @param message The message to reply to.
 * @param options The options to be sent, requiring at least `key` to be passed.
 * @example
 * ```typescript
 * await sendLocalizedMessage(message, {
 * 	key: LanguageKeys.Commands.General.Ping
 * });
 * // ➡ "Pinging..."
 * ```
 * @example
 * ```typescript
 * const latency = 42;
 *
 * await sendLocalizedMessage(message, {
 * 	key: LanguageKeys.Commands.General.PingPong,
 * 	formatOptions: { latency }
 * });
 * // ➡ "Pong! Current latency is 42ms."
 * ```
 */
export function sendLocalizedMessage<TArgs extends object>(message: Message, options: LocalizedMessageOptions<TArgs>): Promise<Message>;
export async function sendLocalizedMessage(message: Message, options: LocalizedSimpleKey | LocalizedMessageOptions) {
	if (typeof options === 'string') options = { key: options };

	// @ts-expect-error 2345: Complex overloads
	const content = await resolveKey(message, options.key, options.formatOptions);
	return send(message, { ...options, content });
}

type LocalizedSimpleKey = TypedT<string>;
type LocalizedMessageOptions<TArgs extends object = object> = Omit<MessageCreateOptions, 'content'> &
	(
		| {
				key: LocalizedSimpleKey;
				formatOptions?: TOptions<TArgs>;
		  }
		| {
				key: TypedFT<TArgs, string>;
				formatOptions: TOptions<TArgs>;
		  }
	);

/**
 * The prompt confirmation options.
 */
export interface PromptConfirmationMessageOptions extends MessageCreateOptions {
	/**
	 * The target.
	 * @default message.author
	 */
	target?: UserResolvable;

	/**
	 * The time for the confirmation to run.
	 * @default minutes(1)
	 */
	time?: number;
}

const enum PromptConfirmationReactions {
	Yes = '🇾',
	No = '🇳'
}

async function promptConfirmationReaction(message: NonGroupMessage, response: NonGroupMessage, options: PromptConfirmationMessageOptions) {
	await response.react(PromptConfirmationReactions.Yes);
	await response.react(PromptConfirmationReactions.No);

	const target = container.client.users.resolveId(options.target ?? message.author);
	const reactions = await response.awaitReactions({ filter: (__, user) => user.id === target, time: minutes(1), max: 1 });

	// Remove all reactions if the user has permissions to do so
	if (canRemoveAllReactions(response.channel)) {
		floatPromise(response.reactions.removeAll());
	}

	return reactions.size === 0 ? null : reactions.firstKey() === PromptConfirmationReactions.Yes;
}

const promptConfirmationMessageRegExp = /^y|yes?|yeah?$/i;
async function promptConfirmationMessage(message: NonGroupMessage, response: NonGroupMessage, options: PromptConfirmationMessageOptions) {
	const target = container.client.users.resolveId(options.target ?? message.author);
	const messages = await response.channel.awaitMessages({ filter: (message) => message.author.id === target, time: minutes(1), max: 1 });

	return messages.size === 0 ? null : promptConfirmationMessageRegExp.test(messages.first()!.content);
}

/**
 * Sends a boolean confirmation prompt asking the `target` for either of two choices.
 * @param message The message to ask for a confirmation from.
 * @param options The options for the message to be sent, alongside the prompt options.
 * @returns `null` if no response was given within the requested time, `boolean` otherwise.
 */
export async function promptConfirmation(message: NonGroupMessage, options: string | PromptConfirmationMessageOptions) {
	if (typeof options === 'string') options = { content: options };

	// TODO: v13 | Switch to buttons only when available.
	const response = (await send(message, options)) as NonGroupMessage;
	return canReact(response.channel)
		? promptConfirmationReaction(message, response, options)
		: promptConfirmationMessage(message, response, options);
}

export async function promptForMessage(
	message: NonGroupMessage,
	sendOptions: string | MessageCreateOptions,
	time = minutes(1)
): Promise<string | null> {
	const response = await message.channel.send(sendOptions);
	const responses = await message.channel.awaitMessages({ filter: (msg) => msg.author === message.author, time, max: 1 });
	floatPromise(deleteMessage(response));

	return responses.size === 0 ? null : responses.first()!.content;
}
