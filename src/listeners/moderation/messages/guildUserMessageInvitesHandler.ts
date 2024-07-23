import { readSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { ModerationMessageListener } from '#lib/moderation';
import type { GuildMessage } from '#lib/types';
import { Colors } from '#utils/constants';
import { deleteMessage, sendTemporaryMessage } from '#utils/functions';
import { getFullEmbedAuthor } from '#utils/util';
import { EmbedBuilder } from '@discordjs/builders';
import { ApplyOptions } from '@sapphire/decorators';
import type { TFunction } from '@sapphire/plugin-i18next';
import type { TextChannel } from 'discord.js';

const enum CodeType {
	DiscordGG,
	ThirdPart
}

@ApplyOptions<ModerationMessageListener.Options>({
	reasonLanguageKey: LanguageKeys.Events.Moderation.Messages.ModerationInvites,
	reasonLanguageKeyWithMaximum: LanguageKeys.Events.Moderation.Messages.ModerationInvitesWithMaximum,
	keyEnabled: 'selfmodInvitesEnabled',
	ignoredChannelsPath: 'selfmodInvitesIgnoredChannels',
	ignoredRolesPath: 'selfmodInvitesIgnoredRoles',
	softPunishmentPath: 'selfmodInvitesSoftAction',
	hardPunishmentPath: {
		action: 'selfmodInvitesHardAction',
		actionDuration: 'selfmodInvitesHardActionDuration',
		adder: 'invites'
	}
})
export class UserModerationMessageListener extends ModerationMessageListener {
	private readonly kInviteRegExp =
		/(?<source>discord\.(?:gg|io|me|plus|link)|invite\.(?:gg|ink)|discord(?:app)?\.com\/invite)\/(?<code>[\w-]{2,})/gi;

	protected async preProcess(message: GuildMessage): Promise<string[] | null> {
		if (message.content.length === 0) return null;

		let value: RegExpExecArray | null = null;
		const promises: Promise<string | null>[] = [];
		const scanned = new Set<string>();
		while ((value = this.kInviteRegExp.exec(message.content)) !== null) {
			const { code, source } = value.groups!;

			// Get from cache, else fetch it from API.
			const identifier = this.getCodeIdentifier(source);

			// If it has already been scanned, skip
			const key = `${source}/${code}`;
			if (scanned.has(key)) continue;
			scanned.add(key);

			promises.push(identifier === CodeType.DiscordGG ? this.scanLink(message, key, code) : Promise.resolve(key));
		}

		const resolved = (await Promise.all(promises)).filter((invite) => invite !== null) as string[];
		return resolved.length === 0 ? null : resolved;
	}

	protected onDelete(message: GuildMessage) {
		return deleteMessage(message);
	}

	protected onAlert(message: GuildMessage, t: TFunction) {
		return sendTemporaryMessage(message, t(LanguageKeys.Events.Moderation.Messages.InviteFilterAlert, { user: message.author.toString() }));
	}

	protected onLogMessage(message: GuildMessage, t: TFunction, links: readonly string[]) {
		return new EmbedBuilder()
			.setColor(Colors.Red)
			.setAuthor(getFullEmbedAuthor(message.author, message.url))
			.setDescription(t(LanguageKeys.Events.Moderation.Messages.InviteFilterLog, { links, count: links.length }))
			.setFooter({ text: `#${(message.channel as TextChannel).name} | ${t(LanguageKeys.Events.Moderation.Messages.InviteFooter)}` })
			.setTimestamp();
	}

	private async scanLink(message: GuildMessage, url: string, code: string) {
		return (await this.fetchIfAllowedInvite(message, code)) ? null : url;
	}

	private async fetchIfAllowedInvite(message: GuildMessage, code: string) {
		const settings = await readSettings(message.guild);

		// Ignored codes take short-circuit.
		if (settings.selfmodInvitesIgnoredCodes.includes(code)) return true;

		const data = await message.client.invites.fetch(code);

		// Invalid invites should not be deleted.
		if (!data.valid) return true;

		// Invites that don't have a guild should be deleted.
		if (data.guildId === null) return false;

		// Invites that point to the own server should be allowed.
		if (data.guildId === message.guild.id) return true;

		// Invites from white-listed guilds should be allowed.
		if (settings.selfmodInvitesIgnoredGuilds.includes(data.guildId)) return true;

		// Any other invite should not be allowed.
		return false;
	}

	private getCodeIdentifier(source: string): CodeType {
		switch (source.toLowerCase()) {
			case 'discordapp.com/invite':
			case 'discord.com/invite':
			case 'discord.gg':
				return CodeType.DiscordGG;
			default:
				return CodeType.ThirdPart;
		}
	}
}
