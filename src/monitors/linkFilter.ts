import { MessageEmbed, TextChannel } from 'discord.js';
import { KlasaMessage } from 'klasa';
import { GuildSettings } from '../lib/types/settings/GuildSettings';
import { ModerationMonitor, HardPunishment } from '../lib/structures/ModerationMonitor';
import { floatPromise } from '../lib/util/util';
import { urlRegex } from '../lib/util/Links/UrlRegex';


export default class extends ModerationMonitor {

	protected readonly keyEnabled = GuildSettings.Selfmod.Links.Enabled;
	protected readonly ignoredChannelsPath = GuildSettings.Selfmod.Links.IgnoredChannels;
	protected readonly ignoredRolesPath = GuildSettings.Selfmod.Links.IgnoredRoles;
	protected readonly softPunishmentPath = GuildSettings.Selfmod.Links.SoftAction;
	protected readonly hardPunishmentPath: HardPunishment = {
		action: GuildSettings.Selfmod.Links.HardAction,
		actionDuration: GuildSettings.Selfmod.Links.HardActionDuration,
		adder: 'links',
		adderMaximum: GuildSettings.Selfmod.Links.ThresholdMaximum,
		adderDuration: GuildSettings.Selfmod.Links.ThresholdDuration
	};

	private readonly kRegExp = urlRegex({ requireProtocol: true, tlds: true });
	private readonly kWhitelist = /^(?:\w+\.)?(?:discordapp.com|discord.gg)$/i;

	public shouldRun(message: KlasaMessage) {
		return super.shouldRun(message)
			&& message.content.length > 0;
	}

	protected preProcess(message: KlasaMessage) {
		let match: RegExpExecArray | null;

		const urls = new Set<string>();
		const whitelist = message.guild!.settings.get(GuildSettings.Selfmod.Links.Whitelist);
		while ((match = this.kRegExp.exec(message.content)) !== null) {
			const { hostname } = match.groups!;
			if (this.kWhitelist.test(hostname)) continue;
			if (whitelist.includes(hostname)) continue;
			urls.add(hostname);
		}

		return urls.size === 0 ? null : urls.size;
	}

	protected onDelete(message: KlasaMessage) {
		floatPromise(this, message.nuke());
	}

	protected onAlert(message: KlasaMessage) {
		floatPromise(this, message.alert(message.language.tget('MONITOR_NOLINK', message.author.toString())));
	}

	protected onLogMessage(message: KlasaMessage) {
		return new MessageEmbed()
			.setColor(0xEFAE45)
			.setAuthor(`${message.author.tag} (${message.author.id})`, message.author.displayAvatarURL({ size: 128 }))
			.setFooter(`#${(message.channel as TextChannel).name} | ${message.language.tget('CONST_MONITOR_LINK')}`)
			.setTimestamp();
	}

}
