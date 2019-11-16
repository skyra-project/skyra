import { MessageEmbed, TextChannel } from 'discord.js';
import { KlasaMessage } from 'klasa';
import { GuildSettings } from '../lib/types/settings/GuildSettings';
import { ModerationMonitor, HardPunishment } from '../lib/structures/ModerationMonitor';
import { floatPromise } from '../lib/util/util';
import { urlRegex } from '../lib/util/Links/UrlRegex';

const kRegExp = urlRegex({ strict: false });
// const kProtocol = /^(?:(?:[a-z]+:)?\/\/)/;

export default class extends ModerationMonitor {

	protected keyEnabled: string = GuildSettings.Selfmod.Links.Enabled;
	protected softPunishmentPath: string = GuildSettings.Selfmod.Links.SoftAction;
	protected hardPunishmentPath: HardPunishment = {
		action: GuildSettings.Selfmod.Links.HardAction,
		actionDuration: GuildSettings.Selfmod.Links.HardActionDuration,
		adder: 'links',
		adderMaximum: GuildSettings.Selfmod.Links.ThresholdMaximum,
		adderDuration: GuildSettings.Selfmod.Links.ThresholdDuration
	};

	public shouldRun(message: KlasaMessage) {
		return super.shouldRun(message)
			&& message.content.length > 0;
	}

	protected preProcess(message: KlasaMessage) {
		const matches = message.content.match(kRegExp);
		if (matches === null) return null;

		// let counter = 0;
		// for (let match of new Set(matches)) {
		// 	if (!kProtocol.test(match)) match = `https://${match}`;
		// }
		return new Set(matches).size;
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
