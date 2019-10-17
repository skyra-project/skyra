import { CommandStore, KlasaMessage } from 'klasa';
import { SkyraCommand } from '../../lib/structures/SkyraCommand';
import { CLIENT_ID } from '../../../config';
import { Colors, GiveawayEmoji, Giveaway } from '../../lib/structures/Giveaway';
import { fetchReactionUsers } from '../../lib/util/util';
import { DiscordAPIError, HTTPError, Message } from 'discord.js';
import { FetchError } from 'node-fetch';
import { Events } from '../../lib/types/Enums';

export default class extends SkyraCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['gr'],
			description: language => language.tget('COMMAND_GIVEAWAYREROLL_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_GIVEAWAYREROLL_EXTENDED'),
			requiredPermissions: ['READ_MESSAGE_HISTORY'],
			runIn: ['text'],
			usage: '(message:message) [winners:number]'
		});

		this.createCustomResolver('message', async (arg, _possible, message) => {
			// If it's a number, return undefined, this allows for `s!greroll 10` and pick 10 winners from last
			if (arg && /^\d{1,10}$/.test(arg)) return undefined;

			const target = arg
				? message.channel.messages.fetch(arg).then(msg => this.validateMessage(msg) ? msg : null).catch(() => null)
				: (await message.channel.messages.fetch()).find(msg => this.validateMessage(msg));
			if (target) return target;
			throw message.language.tget('COMMAND_GIVEAWAYREROLL_INVALID');
		});
	}

	public async run(message: KlasaMessage, [target, winnerAmount = 1]: [KlasaMessage, number]) {
		const { title } = target.embeds[0];
		const winners = await this.pickWinners(target, winnerAmount);
		const content = winners
			? message.language.tget('GIVEAWAY_ENDED_MESSAGE', winners.map(winner => `<@${winner}>`), title)
			: message.language.tget('GIVEAWAY_ENDED_MESSAGE_NO_WINNER', title);
		return message.sendMessage(content);
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
			const users = await fetchReactionUsers(message.client, message.channel.id, message.id, Giveaway.EMOJI);
			users.delete(CLIENT_ID);
			return [...users];
		} catch (error) {
			if (error instanceof DiscordAPIError) {
				// UNKNOWN_MESSAGE | UNKNOWN_EMOJI
				if (error.code === 10008 || error.code === 10014) return [];
			} else if (error instanceof HTTPError || error instanceof FetchError) {
				if (error.code === 'ECONNRESET') return this.fetchParticipants(message);
				this.store.client.emit(Events.ApiError, error);
			}
			return [];
		}
	}

	private validateMessage(message: Message) {
		return message.author !== null
			&& message.author.id === CLIENT_ID
			&& message.embeds.length === 1
			&& message.embeds[0].color === Colors.Red
			&& message.reactions.has(GiveawayEmoji);
	}

}
