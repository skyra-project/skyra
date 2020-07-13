import { GuildSettings } from '@lib/types/settings/GuildSettings';
import { floatPromise } from '@utils/util';
import { KlasaMessage, Monitor, MonitorStore, Stopwatch } from 'klasa';
import { Events } from '@lib/types/Enums';

export default class extends Monitor {

	public constructor(store: MonitorStore, file: string[], directory: string) {
		super(store, file, directory, {
			ignoreOthers: false,
			ignoreEdits: !store.client.options.commandEditing
		});
	}

	public async run(message: KlasaMessage) {
		if (message.guild && message.guild.me === null) await message.guild.members.fetch(this.client.user!.id);
		if (!message.channel.postable) return undefined;
		if (!message.commandText && message.prefix === this.client.mentionPrefix) return this.sendPrefixReminder(message);
		if (!message.commandText) return undefined;
		if (!message.command) return this.client.emit('commandUnknown', message, message.commandText, message.prefix, message.prefixLength);
		this.client.emit('commandRun', message, message.command, message.args);

		return this.runCommand(message);
	}

	public async sendPrefixReminder(message: KlasaMessage) {
		if (message.guild !== null) {
			const disabledChannels = message.guild.settings.get(GuildSettings.DisabledChannels);
			if (disabledChannels.includes(message.channel.id) && !await message.hasAtLeastPermissionLevel(5)) return;
		}
		const prefix = message.guildSettings.get(GuildSettings.Prefix);
		return message.sendLocale('PREFIX_REMINDER', [prefix.length ? prefix : undefined]);
	}

	public async runCommand(message: KlasaMessage) {
		const timer = new Stopwatch();
		if (this.client.options.typing) floatPromise(this, message.channel.startTyping());
		try {
			await this.client.inhibitors.run(message, message.command!);
			try {
				// @ts-expect-error 2341
				await message.prompter!.run();
				try {
					const subcommand = message.command!.subcommands ? message.params.shift() : undefined;
					// @ts-expect-error 7053
					const commandRun = subcommand ? message.command![subcommand](message, message.params) : message.command!.run(message, message.params);
					timer.stop();
					const response = await commandRun;
					floatPromise(this, this.client.finalizers.run(message, message.command!, response, timer));
					this.client.emit(Events.CommandSuccess, message, message.command, message.params, response);
				} catch (error) {
					this.client.emit(Events.CommandError, message, message.command, message.params, error);
				}
			} catch (argumentError) {
				this.client.emit(Events.ArgumentError, message, message.command, message.params, argumentError);
			}
		} catch (response) {
			this.client.emit(Events.CommandInhibited, message, message.command, response);
		}
		if (this.client.options.typing) message.channel.stopTyping();
	}

}
