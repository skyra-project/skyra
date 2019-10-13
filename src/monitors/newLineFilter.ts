import { MessageEmbed, TextChannel } from 'discord.js';
import { KlasaMessage } from 'klasa';
import { GuildSettings } from '../lib/types/settings/GuildSettings';
import { floatPromise, getContent } from '../lib/util/util';
import { ModerationMonitor, HardPunishment } from '../lib/structures/ModerationMonitor';
const NEW_LINE = '\n';

export default class extends ModerationMonitor {

	protected keyEnabled: string = GuildSettings.Selfmod.NewLines.Enabled;
	protected softPunishmentPath: string = GuildSettings.Selfmod.NewLines.SoftAction;
	protected hardPunishmentPath: HardPunishment = {
		action: GuildSettings.Selfmod.NewLines.HardAction,
		actionDuration: GuildSettings.Selfmod.NewLines.HardActionDuration,
		adder: 'newlines',
		adderMaximum: GuildSettings.Selfmod.NewLines.ThresholdMaximum,
		adderDuration: GuildSettings.Selfmod.NewLines.ThresholdDuration
	};

	protected preProcess(message: KlasaMessage) {
		const threshold = message.guild!.settings.get(GuildSettings.Selfmod.NewLines.Maximum);
		if (threshold === 0) return null;

		const content = getContent(message);
		if (content === null) return null;

		let count = 0;
		for (let index = -2; index !== -1; index = content.indexOf(NEW_LINE, index + 1)) count++;

		return count > threshold ? count : null;
	}

	protected onDelete(message: KlasaMessage) {
		floatPromise(this, message.nuke());
	}

	protected onAlert(message: KlasaMessage) {
		floatPromise(this, message.alert(message.language.tget('MONITOR_NEWLINEFILTER', message.author!.toString())));
	}

	protected onLogMessage(message: KlasaMessage) {
		return new MessageEmbed()
			.splitFields(message.content)
			.setColor(0xEFAE45)
			.setAuthor(`${message.author!.tag} (${message.author!.id})`, message.author!.displayAvatarURL({ size: 128 }))
			.setFooter(`#${(message.channel as TextChannel).name} | ${message.language.tget('CONST_MONITOR_NEWLINEFILTER')}`)
			.setTimestamp();
	}

}
