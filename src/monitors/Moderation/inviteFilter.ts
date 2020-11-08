import { GuildSettings } from '@lib/database';
import { HardPunishment, ModerationMonitor } from '@lib/structures/ModerationMonitor';
import { GuildMessage } from '@lib/types';
import { Colors } from '@lib/types/constants/Constants';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { MessageEmbed, TextChannel } from 'discord.js';
import { Language } from 'klasa';

const enum CodeType {
	DiscordGG,
	ThirdPart
}

export default class extends ModerationMonitor {
	protected readonly reasonLanguageKey = LanguageKeys.Monitors.ModerationInvites;
	protected readonly reasonLanguageKeyWithMaximum = LanguageKeys.Monitors.ModerationInvitesWithMaximum;
	protected readonly keyEnabled = GuildSettings.Selfmod.Invites.Enabled;
	protected readonly ignoredChannelsPath = GuildSettings.Selfmod.Invites.IgnoredChannels;
	protected readonly ignoredRolesPath = GuildSettings.Selfmod.Invites.IgnoredRoles;
	protected readonly softPunishmentPath = GuildSettings.Selfmod.Invites.SoftAction;
	protected readonly hardPunishmentPath: HardPunishment = {
		action: GuildSettings.Selfmod.Invites.HardAction,
		actionDuration: GuildSettings.Selfmod.Invites.HardActionDuration,
		adder: 'invites'
	};

	private readonly kInviteRegExp = /(?<source>discord\.(?:gg|io|me|plus|link)|invite\.(?:gg|ink)|discord(?:app)?\.com\/invite)\/(?<code>[\w-]{2,})/gi;

	public shouldRun(message: GuildMessage) {
		return super.shouldRun(message) && message.content.length > 0;
	}

	protected async preProcess(message: GuildMessage) {
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

	protected onAlert(message: GuildMessage, language: Language) {
		return message.alert(language.get(LanguageKeys.Monitors.InviteFilterAlert, { user: message.author.toString() }));
	}

	protected onLogMessage(message: GuildMessage, language: Language, links: readonly string[]) {
		return new MessageEmbed()
			.setColor(Colors.Red)
			.setAuthor(`${message.author.tag} (${message.author.id})`, message.author.displayAvatarURL({ size: 128, format: 'png', dynamic: true }))
			.setDescription(
				language.get(links.length === 1 ? LanguageKeys.Monitors.InviteFilterLog : LanguageKeys.Monitors.InviteFilterLogPlural, {
					links,
					count: links.length
				})
			)
			.setFooter(`#${(message.channel as TextChannel).name} | ${language.get(LanguageKeys.Monitors.InviteFooter)}`)
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
		if (data.guildID === message.guild!.id) return true;

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
