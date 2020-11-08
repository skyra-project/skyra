import { GuildSettings } from '@lib/database';
import { HardPunishment, ModerationMonitor } from '@lib/structures/ModerationMonitor';
import { GuildMessage } from '@lib/types';
import { Colors } from '@lib/types/constants/Constants';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { urlRegex } from '@utils/Links/UrlRegex';
import { MessageEmbed, TextChannel } from 'discord.js';
import { Language } from 'klasa';

export default class extends ModerationMonitor {
	protected readonly reasonLanguageKey = LanguageKeys.Monitors.ModerationLinks;
	protected readonly reasonLanguageKeyWithMaximum = LanguageKeys.Monitors.ModerationLinksWithMaximum;
	protected readonly keyEnabled = GuildSettings.Selfmod.Links.Enabled;
	protected readonly ignoredChannelsPath = GuildSettings.Selfmod.Links.IgnoredChannels;
	protected readonly ignoredRolesPath = GuildSettings.Selfmod.Links.IgnoredRoles;
	protected readonly softPunishmentPath = GuildSettings.Selfmod.Links.SoftAction;
	protected readonly hardPunishmentPath: HardPunishment = {
		action: GuildSettings.Selfmod.Links.HardAction,
		actionDuration: GuildSettings.Selfmod.Links.HardActionDuration,
		adder: 'links'
	};

	private readonly kRegExp = urlRegex({ requireProtocol: true, tlds: true });
	private readonly kWhitelist = /^(?:\w+\.)?(?:discordapp.com|discord.gg|discord.com)$/i;

	public shouldRun(message: GuildMessage) {
		return super.shouldRun(message) && message.content.length > 0;
	}

	protected async preProcess(message: GuildMessage) {
		let match: RegExpExecArray | null = null;

		const urls = new Set<string>();
		const whitelist = await message.guild!.readSettings(GuildSettings.Selfmod.Links.Whitelist);
		while ((match = this.kRegExp.exec(message.content)) !== null) {
			const { hostname } = match.groups!;
			if (this.kWhitelist.test(hostname)) continue;
			if (whitelist.includes(hostname)) continue;
			urls.add(hostname);
		}

		return urls.size === 0 ? null : urls.size;
	}

	protected onDelete(message: GuildMessage) {
		return message.nuke();
	}

	protected onAlert(message: GuildMessage, language: Language) {
		return message.alert(language.get(LanguageKeys.Monitors.LinkMissing, { user: message.author.toString() }));
	}

	protected onLogMessage(message: GuildMessage, language: Language) {
		return new MessageEmbed()
			.setColor(Colors.Red)
			.setAuthor(`${message.author.tag} (${message.author.id})`, message.author.displayAvatarURL({ size: 128, format: 'png', dynamic: true }))
			.setFooter(`#${(message.channel as TextChannel).name} | ${language.get(LanguageKeys.Monitors.LinkFooter)}`)
			.setTimestamp();
	}
}
