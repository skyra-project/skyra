import { readSettings, readSettingsAdder, type GuildSettingsOfType } from '#lib/database';
import { api } from '#lib/discord/Api';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { AutoModerationOnInfraction, ModerationListener, type HardPunishment } from '#lib/moderation';
import { Events } from '#lib/types';
import type { LLRCData } from '#utils/LongLivingReactionCollector';
import { floatPromise, seconds } from '#utils/common';
import { Colors } from '#utils/constants';
import {
	deleteMessage,
	getCustomEmojiUrl,
	getEmojiReactionFormat,
	getEncodedTwemoji,
	getTwemojiUrl,
	isModerator,
	type SerializedEmoji
} from '#utils/functions';
import { getFullEmbedAuthor } from '#utils/util';
import { EmbedBuilder } from '@discordjs/builders';
import { ApplyOptions } from '@sapphire/decorators';
import { fetchT, resolveKey } from '@sapphire/plugin-i18next';
import type { Nullish } from '@sapphire/utilities';

type ArgumentType = [data: LLRCData, reaction: SerializedEmoji, channelId: string | Nullish, blockedReactions: readonly string[]];

@ApplyOptions<ModerationListener.Options>({ event: Events.RawReactionAdd })
export class UserModerationEvent extends ModerationListener<ArgumentType, unknown> {
	protected keyEnabled: GuildSettingsOfType<boolean> = 'selfmodReactionsEnabled';
	protected softPunishmentPath: GuildSettingsOfType<number> = 'selfmodReactionsSoftAction';
	protected hardPunishmentPath: HardPunishment = {
		action: 'selfmodReactionsHardAction',
		actionDuration: 'selfmodReactionsHardActionDuration',
		adder: 'reactions'
	};

	public async run(data: LLRCData, emoji: SerializedEmoji) {
		const settings = await readSettings(data.guild);
		const blockedReactions = settings.selfmodReactionsBlocked;
		const logChannelId = settings.channelsLogsModeration;

		if (!settings.selfmodReactionsEnabled || blockedReactions.length === 0 || settings.channelsIgnoreReactionAdd.includes(data.channel.id)) {
			return;
		}

		const member = await data.guild.members.fetch(data.userId);
		if (member.user.bot || (await isModerator(member))) return;

		const args = [data, emoji, logChannelId, blockedReactions] as const;
		const preProcessed = this.preProcess(args);
		if (preProcessed === null) return;

		const softAction = settings.selfmodReactionsSoftAction;
		const hardAction = settings.selfmodReactionsHardAction;
		this.processSoftPunishment(args, preProcessed, AutoModerationOnInfraction.resolve(softAction));

		const adder = readSettingsAdder(settings, this.hardPunishmentPath.adder);
		if (!adder) return this.processHardPunishment(data.guild, data.userId, hardAction);

		try {
			const points = typeof preProcessed === 'number' ? preProcessed : 1;
			adder.add(data.userId, points);
		} catch {
			await this.processHardPunishment(data.guild, data.userId, hardAction);
		}
	}

	protected preProcess([, emoji, , blockedReactions]: Readonly<ArgumentType>) {
		return blockedReactions.includes(emoji) ? 1 : null;
	}

	protected onDelete([data, emoji]: Readonly<ArgumentType>) {
		floatPromise(api().channels.deleteUserMessageReaction(data.channel.id, data.messageId, getEmojiReactionFormat(emoji), data.userId));
	}

	protected onAlert([data]: Readonly<ArgumentType>) {
		floatPromise(
			resolveKey(data.guild, LanguageKeys.Events.Reactions.Filter, { user: `<@${data.userId}>` })
				.then((content) => data.channel.send(content))
				.then((message) => deleteMessage(message, seconds(15)))
		);
	}

	protected async onLogMessage([data]: Readonly<ArgumentType>) {
		const user = await this.container.client.users.fetch(data.userId);
		const t = await fetchT(data.guild);
		return new EmbedBuilder()
			.setColor(Colors.Red)
			.setAuthor(getFullEmbedAuthor(user))
			.setThumbnail(
				data.emoji.id === null //
					? getTwemojiUrl(getEncodedTwemoji(data.emoji.name!))
					: getCustomEmojiUrl(data.emoji.id, data.emoji.animated)
			)
			.setDescription(`[${t(LanguageKeys.Misc.JumpTo)}](https://discord.com/channels/${data.guild.id}/${data.channel.id}/${data.messageId})`)
			.setFooter({ text: `${data.channel.name} | ${t(LanguageKeys.Events.Reactions.FilterFooter)}` })
			.setTimestamp();
	}

	protected onLog(args: Readonly<ArgumentType>) {
		this.container.client.emit(Events.GuildMessageLog, args[0].guild, args[2], 'channelsLogsModeration', this.onLogMessage.bind(this, args));
	}
}
