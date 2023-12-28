import { GuildSettings, readSettings, writeSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { PermissionLevels, type GuildMessage } from '#lib/types';
import { urlRegex } from '#utils/Links/UrlRegex';
import { days, floatPromise, seconds } from '#utils/common';
import { andMix, type BooleanFn } from '#utils/common/comparators';
import { formatMessage } from '#utils/formatters';
import { sendTemporaryMessage } from '#utils/functions';
import { TypeCodes, metadata } from '#utils/moderationConstants';
import { getFullEmbedAuthor, getImageUrl } from '#utils/util';
import { EmbedBuilder } from '@discordjs/builders';
import { ApplyOptions } from '@sapphire/decorators';
import { canSendAttachments } from '@sapphire/discord.js-utilities';
import { Args, Argument, CommandOptionsRunTypeEnum } from '@sapphire/framework';
import type { TFunction } from '@sapphire/plugin-i18next';
import { isNullish, isNullishOrEmpty } from '@sapphire/utilities';
import { AttachmentBuilder, Collection, PermissionFlagsBits, RESTJSONErrorCodes, type TextChannel } from 'discord.js';

const enum Position {
	Before,
	After
}

const attachmentsFlags = ['f', 'file', 'files', 'upload', 'uploads'] as const;
const imageFlags = ['img', 'image', 'images'] as const;
const authorFlags = ['a', 'author', 'me'] as const;
const botsFlags = ['b', 'bot', 'bots'] as const;
const humansFlags = ['h', 'human', 'humans'] as const;
const invitesFlags = ['i', 'inv', 'invite', 'invites'] as const;
const linksFlags = ['l', 'link', 'links'] as const;
const youFlags = ['y', 'you', 'skyra'] as const;
const pinsFlags = ['p', 'pin', 'pins'] as const;
const silentFlags = ['s', 'silent'] as const;
const ageOptions = ['age'] as const;
const includesOptions = ['include', 'includes', 'contain', 'contains'] as const;

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['purge', 'nuke', 'sweep'],
	description: LanguageKeys.Commands.Moderation.PruneDescription,
	detailedDescription: LanguageKeys.Commands.Moderation.PruneExtended,
	flags: [
		...attachmentsFlags,
		...imageFlags,
		...authorFlags,
		...botsFlags,
		...humansFlags,
		...invitesFlags,
		...linksFlags,
		...youFlags,
		...pinsFlags,
		...silentFlags
	],
	options: [...ageOptions, ...includesOptions],
	permissionLevel: PermissionLevels.Moderator,
	requiredClientPermissions: [PermissionFlagsBits.ManageMessages, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.EmbedLinks],
	runIn: [CommandOptionsRunTypeEnum.GuildAny]
})
export class UserCommand extends SkyraCommand {
	private get timespan(): Argument<number> {
		return this.container.stores.get('arguments').get('timespan') as Argument<number>;
	}

	public override async messageRun(message: GuildMessage, args: SkyraCommand.Args) {
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
		return sendTemporaryMessage(message, content, seconds(10));
	}

	private resolveKeys(messages: readonly string[], position: 'before' | 'after', limit: number) {
		return position === 'before' ? messages.slice(0, limit) : messages.slice(messages.length - limit, messages.length);
	}

	private async getFilters(args: SkyraCommand.Args) {
		const fns: BooleanFn<[GuildMessage]>[] = [];

		const user = args.finished ? null : await args.pick('user').catch(() => null);
		if (user !== null) fns.push((mes: GuildMessage) => mes.author.id === user.id);

		const maximumAge = await this.getAge(args);
		const oldestMessageTimestamp = Date.now() - maximumAge;
		fns.push((mes: GuildMessage) => mes.createdTimestamp > oldestMessageTimestamp);

		if (args.getFlags(...attachmentsFlags)) fns.push((mes: GuildMessage) => mes.attachments.size > 0);
		else if (args.getFlags(...imageFlags)) fns.push((mes: GuildMessage) => mes.attachments.some((at) => !isNullish(getImageUrl(at.url))));
		if (args.getFlags(...authorFlags)) fns.push((mes: GuildMessage) => mes.author.id === args.message.author.id);
		if (args.getFlags(...botsFlags)) fns.push((mes: GuildMessage) => mes.author.bot);
		if (args.getFlags(...humansFlags)) fns.push((mes: GuildMessage) => !mes.author.bot);
		if (args.getFlags(...invitesFlags)) fns.push((mes: GuildMessage) => UserCommand.kInviteRegExp.test(mes.content));
		if (args.getFlags(...linksFlags)) fns.push((mes: GuildMessage) => UserCommand.kLinkRegExp.test(mes.content));
		if (args.getFlags(...youFlags)) fns.push((mes: GuildMessage) => mes.author.id === process.env.CLIENT_ID);
		if (!args.getFlags(...pinsFlags)) fns.push((mes: GuildMessage) => !mes.pinned);

		const includes = args.getOption(...includesOptions)?.toLowerCase();
		if (!isNullishOrEmpty(includes)) fns.push((mes: GuildMessage) => mes.content.toLowerCase().includes(includes));

		return andMix(...fns);
	}

	private resolvePosition(position: Position | null) {
		return position === Position.After ? 'after' : 'before';
	}

	private async getAge(args: SkyraCommand.Args) {
		const parameter = args.getOption(...ageOptions);
		if (parameter === null) return days(14);

		const argument = this.timespan;
		const result = await argument.run(parameter, {
			args,
			argument,
			command: this,
			commandContext: args.commandContext,
			message: args.message,
			minimum: 0,
			maximum: days(14)
		});
		return result.unwrapRaw();
	}

	private async sendPruneLogs(message: GuildMessage, t: TFunction, messages: Collection<string, GuildMessage>, rawMessages: readonly string[]) {
		const channelId = await readSettings(message.guild, GuildSettings.Channels.Logs.Prune);
		if (isNullish(channelId)) return;

		const channel = message.guild.channels.cache.get(channelId) as TextChannel | undefined;
		if (typeof channel === 'undefined') {
			await writeSettings(message.guild, [[GuildSettings.Channels.Logs.Prune, null]]);
			return;
		}

		if (canSendAttachments(channel)) {
			// Filter the messages collection by the deleted messages, so no extras are added.
			messages = messages.filter((_, key) => rawMessages.includes(key));

			const description = t(LanguageKeys.Commands.Moderation.PruneLogMessage, {
				channel: (message.channel as TextChannel).toString(),
				author: message.author.toString(),
				count: messages.size
			});

			const embed = new EmbedBuilder()
				.setAuthor(getFullEmbedAuthor(message.author, message.url))
				.setDescription(description)
				.setColor(UserCommand.kColor)
				.setTimestamp();

			// Send the message to the prune logs channel.
			await channel.send({ embeds: [embed], files: [this.generateAttachment(t, messages)] });
		}
	}

	private generateAttachment(t: TFunction, messages: Collection<string, GuildMessage>) {
		const header = t(LanguageKeys.Commands.Moderation.PruneLogHeader);
		const processed = messages
			.map((message) => formatMessage(t, message))
			.reverse()
			.join('\n\n');
		const buffer = Buffer.from(`${header}\n\n${processed}`);
		return new AttachmentBuilder(buffer, { name: 'prune.txt' });
	}

	private static position = Args.make<Position>((parameter, { argument }) => {
		const position = UserCommand.kCommandPrunePositions[parameter.toLowerCase()];
		if (typeof position === 'undefined') {
			return Args.error({ parameter, argument, identifier: LanguageKeys.Commands.Moderation.PruneInvalidPosition });
		}

		return Args.ok(position);
	});

	private static readonly kColor = metadata.get(TypeCodes.Prune)!.color;
	private static readonly kInviteRegExp = /(?:discord\.(?:gg|io|me|plus|link)|invite\.(?:gg|ink)|discord(?:app)?\.com\/invite)\/(?:[\w-]{2,})/i;
	private static readonly kLinkRegExp = urlRegex({ requireProtocol: true, tlds: true });
	private static readonly kCommandPrunePositions: Record<string, Position> = {
		before: Position.Before,
		b: Position.Before,
		after: Position.After,
		a: Position.After
	};
}
