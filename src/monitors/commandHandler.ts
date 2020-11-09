import { GuildSettings } from '@lib/database';
import { Events, PermissionLevels } from '@lib/types/Enums';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { CLIENT_ID, PREFIX } from '@root/config';
import { floatPromise } from '@utils/util';
import { KlasaMessage, Monitor, MonitorStore, Stopwatch } from 'klasa';

export default class extends Monitor {
	public constructor(store: MonitorStore, file: string[], directory: string) {
		super(store, file, directory, {
			ignoreOthers: false,
			ignoreEdits: !store.client.options.commandEditing
		});
	}

	public async run(message: KlasaMessage) {
		if (message.guild && message.guild.me === null) await message.guild.members.fetch(CLIENT_ID);
		if (!message.channel.postable) return undefined;
		if (!message.commandText && message.prefix === this.client.mentionPrefix) return this.sendPrefixReminder(message);
		if (!message.commandText) return undefined;
		if (!message.command) return this.client.emit('commandUnknown', message, message.commandText, message.prefix, message.prefixLength);
		this.client.emit('commandRun', message, message.command, message.args);

		return this.runCommand(message);
	}

	public async sendPrefixReminder(message: KlasaMessage) {
		if (message.guild !== null) {
			const disabledChannels = await message.guild.readSettings(GuildSettings.DisabledChannels);
			if (disabledChannels.includes(message.channel.id) && !(await message.hasAtLeastPermissionLevel(PermissionLevels.Moderator))) return;
		}

		const prefix = await this.client.fetchPrefix(message);
		if (!prefix) return;

		return message.sendLocale(LanguageKeys.Misc.PrefixReminder, [{ prefix: prefix.length ? prefix : PREFIX }], {
			allowedMentions: { users: [message.author.id], roles: [] }
		});
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
					/* eslint-disable prettier/prettier */
					const commandRun = subcommand
						? // @ts-expect-error7053
						  message.command![subcommand](message, message.params)
						: message.command!.run(message, message.params);
					/* eslint-enable prettier/prettier */
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
