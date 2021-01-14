import { GuildSettings } from '#lib/database';
import { SkyraCommand } from '#lib/structures/commands/SkyraCommand';
import { CommandHandler } from '#lib/types/definitions/Internals';
import { Events, PermissionLevels } from '#lib/types/Enums';
import { cast } from '#utils/util';
import { Message } from 'discord.js';
import { Command, Event, Stopwatch } from 'klasa';

export default class extends Event {
	public async run(message: Message, command: string) {
		if (!message.guild) return null;

		const [disabledChannels, tags, aliases] = await message.guild.readSettings([
			GuildSettings.DisabledChannels,
			GuildSettings.CustomCommands,
			GuildSettings.Trigger.Alias
		]);
		if (disabledChannels.includes(message.channel.id) && !(await message.hasAtLeastPermissionLevel(PermissionLevels.Moderator))) return null;

		command = command.toLowerCase();

		const tag = tags.some((t) => t.id === command);
		if (tag) return this.runTag(message, command);

		const alias = aliases.find((entry) => entry.input === command);
		const commandAlias = (alias && this.client.commands.get(alias.output)) || null;
		if (commandAlias) return this.runCommand(message, commandAlias);

		return null;
	}

	public runCommand(message: Message, command: Command) {
		const commandHandler = cast<CommandHandler>(this.client.monitors.get('commandHandler'));
		message.command = command;
		message.prompter = message.command.usage.createPrompt(message, {
			flagSupport: message.command.flagSupport,
			quotedStringSupport: message.command.quotedStringSupport,
			time: message.command.promptTime,
			limit: message.command.promptLimit
		});
		return commandHandler.runCommand(message);
	}

	public async runTag(message: Message, command: string) {
		const tagCommand = this.client.commands.get('tag') as TagCommand;
		const timer = new Stopwatch();

		try {
			await this.client.inhibitors.run(message, tagCommand);
			try {
				const commandRun = tagCommand.show(message, [command]);
				timer.stop();
				const response = await commandRun;
				this.client.emit(Events.CommandSuccess, message, tagCommand, response, timer);
			} catch (error) {
				this.client.emit(Events.CommandError, message, tagCommand, ['show', command], error);
			}
		} catch (response) {
			this.client.emit(Events.CommandInhibited, message, tagCommand, response);
		}
	}
}

interface TagCommand extends SkyraCommand {
	add(message: Message, args: [string, string]): Promise<Message>;
	remove(message: Message, args: [string]): Promise<Message>;
	edit(message: Message, args: [string, string]): Promise<Message>;
	list(message: Message): Promise<Message>;
	show(message: Message, args: [string]): Promise<Message>;
	source(message: Message, args: [string]): Promise<Message>;
}
