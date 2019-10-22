import { MessageEmbed, TextChannel } from 'discord.js';
import { KlasaMessage } from 'klasa';
import { GuildSettings } from '../lib/types/settings/GuildSettings';
import { ModerationMonitor, HardPunishment } from '../lib/structures/ModerationMonitor';
import { floatPromise } from '../lib/util/util';

const kRegExp = /(discord\.(gg|io|me|li)\/|discordapp\.com\/invite\/)[\w\d]{2,}/i;

export default class extends ModerationMonitor {

	protected keyEnabled: string = GuildSettings.Selfmod.Invites.Enabled;
	protected softPunishmentPath: string = GuildSettings.Selfmod.Invites.SoftAction;
	protected hardPunishmentPath: HardPunishment = {
		action: GuildSettings.Selfmod.Invites.HardAction,
		actionDuration: GuildSettings.Selfmod.Invites.HardActionDuration,
		adder: 'invites',
		adderMaximum: GuildSettings.Selfmod.Invites.ThresholdMaximum,
		adderDuration: GuildSettings.Selfmod.Invites.ThresholdDuration
	};

	public shouldRun(message: KlasaMessage) {
		return super.shouldRun(message)
			&& message.content.length > 0;
	}

	protected preProcess(message: KlasaMessage) {
		return kRegExp.test(message.content) ? 1 : null;
	}

	protected onDelete(message: KlasaMessage) {
		floatPromise(this, message.nuke());
	}

	protected onAlert(message: KlasaMessage) {
		floatPromise(this, message.alert(message.language.tget('MONITOR_NOINVITE', message.author.toString())));
	}

	protected onLogMessage(message: KlasaMessage) {
		return new MessageEmbed()
			.setColor(0xEFAE45)
			.setAuthor(`${message.author.tag} (${message.author.id})`, message.author.displayAvatarURL({ size: 128 }))
			.setFooter(`#${(message.channel as TextChannel).name} | ${message.language.tget('CONST_MONITOR_INVITELINK')}`)
			.setTimestamp();
	}

}
