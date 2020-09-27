import { HardPunishment, ModerationMonitor } from '@lib/structures/ModerationMonitor';
import { Colors } from '@lib/types/constants/Constants';
import { GuildSettings } from '@lib/types/namespaces/GuildSettings';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { floatPromise, getContent } from '@utils/util';
import { MessageEmbed, TextChannel } from 'discord.js';
import { KlasaMessage } from 'klasa';

export default class extends ModerationMonitor {
	protected readonly reasonLanguageKey = LanguageKeys.Monitors.ModerationMessages;
	protected readonly reasonLanguageKeyWithMaximum = LanguageKeys.Monitors.ModerationMessagesWithMaximum;
	protected readonly keyEnabled = GuildSettings.Selfmod.Messages.Enabled;
	protected readonly ignoredChannelsPath = GuildSettings.Selfmod.Messages.IgnoredChannels;
	protected readonly ignoredRolesPath = GuildSettings.Selfmod.Messages.IgnoredRoles;
	protected readonly softPunishmentPath = GuildSettings.Selfmod.Messages.SoftAction;
	protected readonly hardPunishmentPath: HardPunishment = {
		action: GuildSettings.Selfmod.Messages.HardAction,
		actionDuration: GuildSettings.Selfmod.Messages.HardActionDuration,
		adder: 'messages',
		adderMaximum: GuildSettings.Selfmod.Messages.ThresholdMaximum,
		adderDuration: GuildSettings.Selfmod.Messages.ThresholdDuration
	};

	private readonly kChannels = new WeakMap<TextChannel, string[]>();

	protected preProcess(message: KlasaMessage) {
		// Retrieve the threshold
		const threshold = message.guild!.settings.get(GuildSettings.Selfmod.Messages.Maximum);
		if (threshold === 0) return null;

		// Retrieve the content
		const content = getContent(message);
		if (content === null) return null;

		// Retrieve the contents, then update them to add the new content to the FILO queue.
		const contents = this.getContents(message);
		const count = this.updateContents(message, contents, content.toLowerCase());

		// If count is bigger than threshold
		// - return `count` (runs the rest of the monitor),
		// - else return `null` (stops)
		return count > threshold ? count : null;
	}

	protected onDelete(message: KlasaMessage) {
		floatPromise(this, message.nuke());
	}

	protected onAlert(message: KlasaMessage) {
		floatPromise(this, message.alert(message.language.get(LanguageKeys.Monitors.MessageFilter, { user: message.author.toString() })));
	}

	protected onLogMessage(message: KlasaMessage) {
		return new MessageEmbed()
			.splitFields(message.content)
			.setColor(Colors.Red)
			.setAuthor(`${message.author.tag} (${message.author.id})`, message.author.displayAvatarURL({ size: 128, format: 'png', dynamic: true }))
			.setFooter(`#${(message.channel as TextChannel).name} | ${message.language.get(LanguageKeys.Monitors.MessageFooter)}`)
			.setTimestamp();
	}

	private getContents(message: KlasaMessage) {
		const previousValue = this.kChannels.get(message.channel as TextChannel);
		if (typeof previousValue === 'undefined') {
			const nextValue: string[] = [];
			this.kChannels.set(message.channel as TextChannel, nextValue);
			return nextValue;
		}

		return previousValue;
	}

	private updateContents(message: KlasaMessage, contents: string[], content: string) {
		const queueSize = message.guild!.settings.get(GuildSettings.Selfmod.Messages.QueueSize);

		// Queue FILO behaviour, first-in, last-out.
		if (contents.length >= queueSize) contents.length = queueSize - 1;
		contents.unshift(content);

		return contents.reduce((accumulator, ct) => (ct === content ? accumulator + 1 : accumulator), 1);
	}
}
