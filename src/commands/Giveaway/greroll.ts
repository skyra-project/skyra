import { kRawEmoji } from '@lib/database/entities/GiveawayEntity';
import { SkyraCommand } from '@lib/structures/SkyraCommand';
import { Colors } from '@lib/types/constants/Constants';
import { Events } from '@lib/types/Enums';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { CLIENT_ID } from '@root/config';
import { fetchReactionUsers, resolveEmoji } from '@utils/util';
import { RESTJSONErrorCodes } from 'discord-api-types/v6';
import { DiscordAPIError, HTTPError, Message } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';
import { FetchError } from 'node-fetch';

export default class extends SkyraCommand {
	// eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
	#kResolvedEmoji = resolveEmoji(kRawEmoji)!;

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['gr', 'groll'],
			description: (language) => language.get(LanguageKeys.Commands.Giveaway.GiveawayRerollDescription),
			extendedHelp: (language) => language.get(LanguageKeys.Commands.Giveaway.GiveawayRerollExtended),
			requiredPermissions: ['READ_MESSAGE_HISTORY'],
			runIn: ['text'],
			usage: '[winners:number{1,100}] [message:message]',
			usageDelim: ' '
		});
	}

	public async run(message: KlasaMessage, [winnerAmount = 1, rawTarget]: [number, KlasaMessage | undefined]) {
		const target = await this.resolveMessage(message, rawTarget);
		const { title } = target.embeds[0];
		const winners = await this.pickWinners(target, winnerAmount);
		const content = winners
			? message.language.get(LanguageKeys.Giveaway.EndedMessage, {
					winners: winners.map((winner) => `<@${winner}>`),
					title: title!
			  })
			: message.language.get(LanguageKeys.Giveaway.EndedMessageNoWinner, { title: title! });
		return message.sendMessage(content, { allowedMentions: { users: [...new Set([message.author.id, ...(winners || [])])], roles: [] } });
	}

	private async resolveMessage(message: KlasaMessage, rawTarget: KlasaMessage | undefined) {
		const target = rawTarget
			? // If rawMessage is defined then we check everything sans the colour
			  this.validateMessage(rawTarget)
				? rawTarget
				: null
			: // If rawTarget was undefined then we fetch it from the API and we check embed colour
			  (await message.channel.messages.fetch({ limit: 100 })).find((msg) => this.validatePossibleMessage(msg)) || null;
		if (target) return target as KlasaMessage;
		throw message.language.get(LanguageKeys.Commands.Giveaway.GiveawayRerollInvalid);
	}

	private async pickWinners(message: KlasaMessage, winnerAmount: number) {
		const participants = await this.fetchParticipants(message);
		if (participants.length < winnerAmount) return null;

		let m = participants.length;
		while (m) {
			const i = Math.floor(Math.random() * m--);
			[participants[m], participants[i]] = [participants[i], participants[m]];
		}
		return participants.slice(0, winnerAmount);
	}

	private async fetchParticipants(message: KlasaMessage): Promise<string[]> {
		try {
			const users = await fetchReactionUsers(message.client, message.channel.id, message.id, this.#kResolvedEmoji);
			users.delete(CLIENT_ID);
			return [...users];
		} catch (error) {
			if (error instanceof DiscordAPIError) {
				if (error.code === RESTJSONErrorCodes.UnknownMessage || error.code === RESTJSONErrorCodes.UnknownEmoji) return [];
			} else if (error instanceof HTTPError || error instanceof FetchError) {
				if (error.code === 'ECONNRESET') return this.fetchParticipants(message);
				this.store.client.emit(Events.ApiError, error);
			}
			return [];
		}
	}

	/**
	 * Validates that this message is a message from Skyra and is a giveaway
	 */
	private validateMessage(message: Message) {
		return message.author !== null && message.author.id === CLIENT_ID && message.embeds.length === 1 && message.reactions.cache.has(kRawEmoji);
	}

	/**
	 * Validates that this is a Skyra giveaway and that it has ended
	 */
	private validatePossibleMessage(message: Message) {
		return this.validateMessage(message) && message.embeds[0].color === Colors.Red;
	}
}
