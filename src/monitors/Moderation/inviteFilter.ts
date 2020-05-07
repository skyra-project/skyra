import { HardPunishment, ModerationMonitor } from '@lib/structures/ModerationMonitor';
import { GuildSettings } from '@lib/types/settings/GuildSettings';
import { floatPromise } from '@utils/util';
import { MessageEmbed, TextChannel } from 'discord.js';
import { KlasaMessage } from 'klasa';
import { Colors } from '@lib/types/constants/Constants';
import { Events } from '@lib/types/Enums';

const enum CodeType {
	DiscordGG,
	DiscordIO,
	DiscordME,
	DiscordPlus
}

export default class extends ModerationMonitor {

	protected readonly reasonLanguageKey = 'MODERATION_MONITOR_INVITES';
	protected readonly keyEnabled = GuildSettings.Selfmod.Invites.Enabled;
	protected readonly ignoredChannelsPath = GuildSettings.Selfmod.Invites.IgnoredChannels;
	protected readonly ignoredRolesPath = GuildSettings.Selfmod.Invites.IgnoredRoles;
	protected readonly softPunishmentPath = GuildSettings.Selfmod.Invites.SoftAction;
	protected readonly hardPunishmentPath: HardPunishment = {
		action: GuildSettings.Selfmod.Invites.HardAction,
		actionDuration: GuildSettings.Selfmod.Invites.HardActionDuration,
		adder: 'invites',
		adderMaximum: GuildSettings.Selfmod.Invites.ThresholdMaximum,
		adderDuration: GuildSettings.Selfmod.Invites.ThresholdDuration
	};

	private readonly kInviteRegExp = /(?<source>discord\.(?:gg|io|me|plus)\/|discordapp\.com\/invite\/)(?<code>[\w\d-]{2,})/gi;

	public shouldRun(message: KlasaMessage) {
		return super.shouldRun(message)
			&& message.content.length > 0;
	}

	protected async preProcess(message: KlasaMessage) {
		let value: RegExpExecArray | null;
		const promises: Promise<boolean>[] = [];
		const scanned = new Set<string>();
		while ((value = this.kInviteRegExp.exec(message.content)) !== null) {
			const { code, source } = value.groups!;

			// Get from cache, else fetch it from API.
			const identifier = this.getCodeIdentifier(source, code);
			if (identifier === null) continue;

			// If it has already been scanned, skip
			const key = `${source}${code}`;
			if (scanned.has(key)) continue;
			scanned.add(key);

			promises.push(identifier === CodeType.DiscordGG
				? this.fetchIfAllowedInvite(message, code)
				: Promise.resolve(false));
		}

		const resolved = await Promise.all(promises);
		const counter = resolved.reduce((acc, v) => acc + (v ? 0 : 1), 0);
		return counter === 0 ? null : counter;
	}

	protected onDelete(message: KlasaMessage) {
		floatPromise(this, message.nuke());
	}

	protected onAlert(message: KlasaMessage) {
		floatPromise(this, message.alert(message.language.tget('MONITOR_NOINVITE', message.author.toString())));
	}

	protected onLogMessage(message: KlasaMessage) {
		return new MessageEmbed()
			.setColor(Colors.Red)
			.setAuthor(`${message.author.tag} (${message.author.id})`, message.author.displayAvatarURL({ size: 128, format: 'png', dynamic: true }))
			.setFooter(`#${(message.channel as TextChannel).name} | ${message.language.tget('CONST_MONITOR_INVITELINK')}`)
			.setTimestamp();
	}

	private async fetchIfAllowedInvite(message: KlasaMessage, code: string) {
		// Ignored codes take short-circuit.
		if (message.guild!.settings.get(GuildSettings.Selfmod.Invites.IgnoredCodes).includes(code)) return true;

		const data = await this.client.invites.fetch(code);

		// Invalid invites should not be deleted.
		if (!data.valid) return true;

		// Invites that don't have a guild should be deleted.
		if (data.guildID === null) return false;

		// Invites that point to the own server should be allowed.
		if (data.guildID === message.guild!.id) return true;

		// Invites from white-listed guilds should be allowed.
		if (message.guild!.settings.get(GuildSettings.Selfmod.Invites.IgnoredGuilds).includes(data.guildID)) return true;

		// Any other invite should not be allowed.
		return false;
	}

	private getCodeIdentifier(source: string, code: string): CodeType | null {
		switch (source.toLowerCase()) {
			case 'discordapp.com/invite/':
			case 'discord.gg/':
				return CodeType.DiscordGG;
			case 'discord.io/':
				return CodeType.DiscordIO;
			case 'discord.me/':
				return CodeType.DiscordME;
			case 'discord.plus/':
				return CodeType.DiscordPlus;
			default:
				this.client.emit(Events.Wtf, `Unrecognized source ${source} with code ${code}.`);
				return null;
		}
	}

}
