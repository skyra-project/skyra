import { GuildSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { ModerationMessageEvent } from '#lib/structures/moderation/ModerationMessageEvent';
import type { GuildMessage } from '#lib/types';
import { Colors } from '#lib/types/Constants';
import { ApplyOptions } from '@skyra/decorators';
import { MessageEmbed, TextChannel } from 'discord.js';
import type { TFunction } from 'i18next';

const enum CodeType {
	DiscordGG,
	ThirdPart
}

@ApplyOptions<ModerationMessageEvent.Options>({
	reasonLanguageKey: LanguageKeys.Monitors.ModerationInvites,
	reasonLanguageKeyWithMaximum: LanguageKeys.Monitors.ModerationInvitesWithMaximum,
	keyEnabled: GuildSettings.Selfmod.Invites.Enabled,
	ignoredChannelsPath: GuildSettings.Selfmod.Invites.IgnoredChannels,
	ignoredRolesPath: GuildSettings.Selfmod.Invites.IgnoredRoles,
	softPunishmentPath: GuildSettings.Selfmod.Invites.SoftAction,
	hardPunishmentPath: {
		action: GuildSettings.Selfmod.Invites.HardAction,
		actionDuration: GuildSettings.Selfmod.Invites.HardActionDuration,
		adder: 'invites'
	}
})
export default class extends ModerationMessageEvent {
	private readonly kInviteRegExp = /(?<source>discord\.(?:gg|io|me|plus|link)|invite\.(?:gg|ink)|discord(?:app)?\.com\/invite)\/(?<code>[\w-]{2,})/gi;

	protected async preProcess(message: GuildMessage) {
		if (message.content.length === 0) return null;

		let value: RegExpExecArray | null = null;
		const promises: Promise<string | null>[] = [];
		const scanned = new Set<string>();
		while ((value = this.kInviteRegExp.exec(message.content)) !== null) {
			const { code, source } = value.groups!;

			// Get from cache, else fetch it from API.
			const identifier = this.getCodeIdentifier(source);

			// If it has already been scanned, skip
			const key = `${source}${code}`;
			if (scanned.has(key)) continue;
			scanned.add(key);

			promises.push(identifier === CodeType.DiscordGG ? this.scanLink(message, key, code) : Promise.resolve(key));
		}

		const resolved = (await Promise.all(promises)).filter((invite) => invite !== null) as string[];
		return resolved.length === 0 ? null : resolved;
	}

	protected onDelete(message: GuildMessage) {
		return message.nuke();
	}

	protected onAlert(message: GuildMessage, t: TFunction) {
		return message.alert(t(LanguageKeys.Monitors.InviteFilterAlert, { user: message.author.toString() }));
	}

	protected onLogMessage(message: GuildMessage, t: TFunction, links: readonly string[]) {
		return new MessageEmbed()
			.setColor(Colors.Red)
			.setAuthor(`${message.author.tag} (${message.author.id})`, message.author.displayAvatarURL({ size: 128, format: 'png', dynamic: true }))
			.setDescription(t(LanguageKeys.Monitors.InviteFilterLog, { links, count: links.length }))
			.setFooter(`#${(message.channel as TextChannel).name} | ${t(LanguageKeys.Monitors.InviteFooter)}`)
			.setTimestamp();
	}

	private async scanLink(message: GuildMessage, url: string, code: string) {
		return (await this.fetchIfAllowedInvite(message, code)) ? null : url;
	}

	private async fetchIfAllowedInvite(message: GuildMessage, code: string) {
		const [ignoredCodes, ignoredGuilds] = await message.guild.readSettings([
			GuildSettings.Selfmod.Invites.IgnoredCodes,
			GuildSettings.Selfmod.Invites.IgnoredGuilds
		]);

		// Ignored codes take short-circuit.
		if (ignoredCodes.includes(code)) return true;

		const data = await this.client.invites.fetch(code);

		// Invalid invites should not be deleted.
		if (!data.valid) return true;

		// Invites that don't have a guild should be deleted.
		if (data.guildID === null) return false;

		// Invites that point to the own server should be allowed.
		if (data.guildID === message.guild.id) return true;

		// Invites from white-listed guilds should be allowed.
		if (ignoredGuilds.includes(data.guildID)) return true;

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
