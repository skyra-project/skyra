import { GuildSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import { PermissionLevels } from '#lib/types/Enums';
import { andMix, BooleanFn } from '#utils/comparators';
import { Moderation } from '#utils/constants';
import { formatMessage } from '#utils/formatters';
import { urlRegex } from '#utils/Links/UrlRegex';
import { floatPromise } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { Args } from '@sapphire/framework';
import { Time } from '@sapphire/time-utilities';
import { isNullish } from '@sapphire/utilities';
import { RESTJSONErrorCodes } from 'discord-api-types/v6';
import { Collection, MessageAttachment, MessageEmbed, TextChannel } from 'discord.js';
import type { TFunction } from 'i18next';

const enum Position {
	Before,
	After
}

const attachmentsFlags = ['f', 'file', 'files', 'upload', 'uploads'] as const;
const authorFlags = ['a', 'author', 'me'] as const;
const botsFlags = ['b', 'bot', 'bots'] as const;
const humansFlags = ['h', 'human', 'humans'] as const;
const invitesFlags = ['i', 'invite', 'invites'] as const;
const linksFlags = ['l', 'link', 'links'] as const;
const youFlags = ['y', 'you', 'skyra'] as const;
const pinsFlags = ['p', 'pin', 'pins'] as const;
const silentFlags = ['s', 'silent'] as const;

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['purge', 'nuke', 'sweep'],
	cooldown: 5,
	description: LanguageKeys.Commands.Moderation.PruneDescription,
	extendedHelp: LanguageKeys.Commands.Moderation.PruneExtended,
	permissionLevel: PermissionLevels.Moderator,
	strategyOptions: {
		flags: [
			...attachmentsFlags,
			...authorFlags,
			...botsFlags,
			...humansFlags,
			...invitesFlags,
			...linksFlags,
			...youFlags,
			...pinsFlags,
			...silentFlags
		]
	},
	permissions: ['MANAGE_MESSAGES', 'READ_MESSAGE_HISTORY', 'EMBED_LINKS'],
	runIn: ['text', 'news']
})
export class UserCommand extends SkyraCommand {
	public async run(message: GuildMessage, args: SkyraCommand.Args) {
		const limit = await args.pick('integer', { minimum: 1, maximum: 100 });
		const filter = await this.getFilters(args);
		const rawPosition = args.finished ? null : await args.pick(UserCommand.position);
		const targetMessage = args.finished && rawPosition === null ? message : await args.pick('message');

		const position = this.resolvePosition(rawPosition);

		// Fetch the messages
		const messages = (await message.channel.messages.fetch({ limit: 100, [position]: targetMessage.id })) as Collection<string, GuildMessage>;

		// Filter the messages by their age
		const filtered = messages.filter(filter);
		if (filtered.size === 0) this.error(LanguageKeys.Commands.Moderation.PruneNoDeletes);

		const silent = args.getFlags(...silentFlags);
		if (silent && filtered.size !== 100) {
			filtered.set(message.id, message);
		}

		// Perform a bulk delete, throw if it returns unknown message.
		const filteredKeys = this.resolveKeys([...filtered.keys()], position, limit);
		await (message.channel as TextChannel).bulkDelete(filteredKeys).catch((error) => {
			if (error.code !== RESTJSONErrorCodes.UnknownMessage) throw error;
		});

		// Send prune logs and reply to the channel
		floatPromise(this.sendPruneLogs(message, args.t, filtered, filteredKeys));
		if (silent) return null;

		const content = args.t(LanguageKeys.Commands.Moderation.PruneAlert, { count: filteredKeys.length, total: limit });
		return message.alert(content, Time.Second * 10);
	}

	private resolveKeys(messages: readonly string[], position: 'before' | 'after', limit: number) {
		return position === 'before' ? messages.slice(0, limit) : messages.slice(messages.length - limit, messages.length);
	}

	private async getFilters(args: SkyraCommand.Args) {
		const fns: BooleanFn<[GuildMessage]>[] = [];

		fns.push((mes: GuildMessage) => mes.createdTimestamp > 0);
		if (args.getFlags(...attachmentsFlags)) fns.push((mes: GuildMessage) => mes.attachments.size > 0);
		if (args.getFlags(...authorFlags)) fns.push((mes: GuildMessage) => mes.author.id === args.message.author.id);
		if (args.getFlags(...botsFlags)) fns.push((mes: GuildMessage) => mes.author.bot);
		if (args.getFlags(...humansFlags)) fns.push((mes: GuildMessage) => mes.author.id === args.message.author.id);
		if (args.getFlags(...invitesFlags)) fns.push((mes: GuildMessage) => UserCommand.kInviteRegExp.test(mes.content));
		if (args.getFlags(...linksFlags)) fns.push((mes: GuildMessage) => UserCommand.kLinkRegExp.test(mes.content));
		if (args.getFlags(...youFlags)) fns.push((mes: GuildMessage) => mes.author.id === process.env.CLIENT_ID);
		if (!args.getFlags(...pinsFlags)) fns.push((mes: GuildMessage) => !mes.pinned);

		const user = args.finished ? null : await args.pick('user').catch(() => null);
		if (user !== null) fns.push((mes: GuildMessage) => mes.author.id === user.id);

		const oldestMessageTimestamp = Date.now() - Time.Day * 14;
		fns.push((mes: GuildMessage) => mes.createdTimestamp > oldestMessageTimestamp);

		return andMix(fns);
	}

	private resolvePosition(position: Position | null) {
		return position === Position.After ? 'after' : 'before';
	}

	private async sendPruneLogs(message: GuildMessage, t: TFunction, messages: Collection<string, GuildMessage>, rawMessages: readonly string[]) {
		const channelID = await message.guild.readSettings(GuildSettings.Channels.Logs.Prune);
		if (isNullish(channelID)) return;

		const channel = message.guild.channels.cache.get(channelID) as TextChannel | undefined;
		if (typeof channel === 'undefined') {
			await message.guild.writeSettings([[GuildSettings.Channels.Logs.Prune, null]]);
			return;
		}

		if (channel.attachable) {
			// Filter the messages collection by the deleted messages, so no extras are added.
			messages = messages.filter((_, key) => rawMessages.includes(key));

			// Send the message to the prune logs channel.
			await channel.send('', {
				embed: new MessageEmbed()
					.setAuthor(
						`${message.author.tag} (${message.author.id})`,
						message.author.displayAvatarURL({ size: 128, format: 'png', dynamic: true })
					)
					.setDescription(
						t(LanguageKeys.Commands.Moderation.PruneLogMessage, {
							channel: (message.channel as TextChannel).toString(),
							author: message.author.toString(),
							count: messages.size
						})
					)
					.setColor(UserCommand.kColor)
					.setTimestamp(),
				files: [this.generateAttachment(t, messages)]
			});
		}
	}

	private generateAttachment(t: TFunction, messages: Collection<string, GuildMessage>) {
		const header = t(LanguageKeys.Commands.Moderation.PruneLogHeader);
		const processed = messages
			.map((message) => formatMessage(t, message))
			.reverse()
			.join('\n\n');
		const buffer = Buffer.from(`${header}\n\n${processed}`);
		return new MessageAttachment(buffer, 'prune.txt');
	}

	private static position = Args.make<Position>((parameter, { argument }) => {
		const position = this.kCommandPrunePositions[parameter.toLowerCase()];
		if (typeof position === 'undefined') {
			return Args.error({ parameter, argument, identifier: LanguageKeys.Commands.Moderation.PruneInvalidPosition });
		}

		return Args.ok(position);
	});

	private static readonly kColor = Moderation.metadata.get(Moderation.TypeCodes.Prune)!.color;
	private static readonly kInviteRegExp = /(?:discord\.(?:gg|io|me|plus|link)|invite\.(?:gg|ink)|discord(?:app)?\.com\/invite)\/(?:[\w-]{2,})/i;
	private static readonly kLinkRegExp = urlRegex({ requireProtocol: true, tlds: true });
	private static readonly kCommandPrunePositions: Record<string, Position> = {
		before: Position.Before,
		b: Position.Before,
		after: Position.After,
		a: Position.After
	};
}
