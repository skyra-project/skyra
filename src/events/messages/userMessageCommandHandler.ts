import { GuildSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { Events, PermissionLevels } from '#lib/types/Enums';
import { CLIENT_ID, PREFIX } from '#root/config';
import { floatPromise } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { Stopwatch } from '@sapphire/stopwatch';
import type { Message } from 'discord.js';
import { Event, EventOptions } from 'klasa';

@ApplyOptions<EventOptions>({ event: Events.UserMessage })
export default class extends Event {
	public async run(message: Message) {
		if (message.guild && message.guild.me === null) await message.guild.members.fetch(CLIENT_ID);
		if (!message.channel.postable) return undefined;

		await message.parseCommand();
		const { client } = this.context;
		if (!message.commandText && message.prefix === client.mentionPrefix) return this.sendPrefixReminder(message);
		if (!message.commandText) return undefined;
		if (!message.command) return client.emit(Events.CommandUnknown, message, message.commandText, message.prefix, message.prefixLength);
		client.emit(Events.CommandRun, message, message.command, message.args);

		return this.runCommand(message);
	}

	public async sendPrefixReminder(message: Message) {
		if (message.guild !== null) {
			const disabledChannels = await message.guild.readSettings(GuildSettings.DisabledChannels);
			if (disabledChannels.includes(message.channel.id) && !(await message.hasAtLeastPermissionLevel(PermissionLevels.Moderator))) return;
		}

		const prefix = await this.context.client.fetchPrefix(message);
		if (!prefix) return;

		return message.sendTranslated(LanguageKeys.Misc.PrefixReminder, [{ prefix: prefix.length ? prefix : PREFIX }], {
			allowedMentions: { users: [message.author.id], roles: [] }
		});
	}

	public async runCommand(message: Message) {
		const { client } = this.context;
		const timer = new Stopwatch();
		if (client.options.typing) floatPromise(message.channel.startTyping());
		try {
			await client.inhibitors.run(message, message.command!);
			try {
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
					client.emit(Events.CommandSuccess, message, message.command!, response, timer);
				} catch (error) {
					client.emit(Events.CommandError, message, message.command, message.params, error);
				}
			} catch (argumentError) {
				client.emit(Events.ArgumentError, message, message.command, message.params, argumentError);
			}
		} catch (response) {
			client.emit(Events.CommandInhibited, message, message.command, response);
		}
		if (client.options.typing) message.channel.stopTyping();
	}
}
