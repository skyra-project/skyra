import { MessageEmbed, TextChannel } from 'discord.js';
import { KlasaMessage } from 'klasa';
import { GuildSettings } from '../lib/types/settings/GuildSettings';
import { floatPromise, getContent } from '../lib/util/util';
import { ModerationMonitor, HardPunishment } from '../lib/structures/ModerationMonitor';

export default class extends ModerationMonitor {

	protected keyEnabled: string = GuildSettings.Selfmod.Messages.Enabled;
	protected softPunishmentPath: string = GuildSettings.Selfmod.Messages.SoftAction;
	protected hardPunishmentPath: HardPunishment = {
		action: GuildSettings.Selfmod.Messages.HardAction,
		actionDuration: GuildSettings.Selfmod.Messages.HardActionDuration,
		adder: 'messages',
		adderMaximum: GuildSettings.Selfmod.Messages.ThresholdMaximum,
		adderDuration: GuildSettings.Selfmod.Messages.ThresholdDuration
	};
	private readonly kChannels = new WeakMap<TextChannel, string[]>();
	private readonly kMaximumEntries = 50;

	protected preProcess(message: KlasaMessage) {
		const threshold = message.guild!.settings.get(GuildSettings.Selfmod.Messages.Maximum);
		if (threshold === 0) return null;

		const content = getContent(message);
		if (content === null) return null;

		const lowerCasedContent = content.toLowerCase();
		const contents = this.getEntries(message);
		const count = this.getCount(contents, lowerCasedContent);
		this.addEntry(contents, lowerCasedContent);

		return count > threshold ? count : null;
	}

	protected onDelete(message: KlasaMessage) {
		floatPromise(this, message.nuke());
	}

	protected onAlert(message: KlasaMessage) {
		floatPromise(this, message.alert(message.language.tget('MONITOR_MESSAGEFILTER', message.author.toString())));
	}

	protected onLogMessage(message: KlasaMessage) {
		return new MessageEmbed()
			.splitFields(message.content)
			.setColor(0xEFAE45)
			.setAuthor(`${message.author.tag} (${message.author.id})`, message.author.displayAvatarURL({ size: 128 }))
			.setFooter(`#${(message.channel as TextChannel).name} | ${message.language.tget('CONST_MONITOR_MESSAGEFILTER')}`)
			.setTimestamp();
	}

	private getEntries(message: KlasaMessage) {
		const previousValue = this.kChannels.get(message.channel as TextChannel);
		if (typeof previousValue === 'undefined') {
			const nextValue: string[] = [];
			this.kChannels.set(message.channel as TextChannel, nextValue);
			return nextValue;
		}

		return previousValue;
	}

	private getCount(contents: readonly string[], value: string) {
		let counter = 1;

		for (const content of contents) {
			if (content === value) ++counter;
		}

		return counter;
	}

	private addEntry(contents: string[], content: string) {
		// Queue FILO behaviour, first-in, last-out.
		if (contents.length === this.kMaximumEntries) contents.pop();
		contents.unshift(content);
	}

}
