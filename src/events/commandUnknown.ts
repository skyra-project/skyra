import { SkyraCommand } from '@lib/structures/SkyraCommand';
import { CommandHandler } from '@lib/types/definitions/Internals';
import { Events, PermissionLevels } from '@lib/types/Enums';
import { GuildSettings } from '@lib/types/namespaces/GuildSettings';
import { cast, floatPromise } from '@utils/util';
import { Command, Event, KlasaMessage, Stopwatch } from 'klasa';

export default class extends Event {
	public run(message: KlasaMessage, command: string) {
		if (!message.guild) return null;

		const disabledChannels = message.guild.settings.get(GuildSettings.DisabledChannels);
		if (disabledChannels.includes(message.channel.id) && !message.hasAtLeastPermissionLevel(PermissionLevels.Moderator)) return null;

		command = command.toLowerCase();

		const tags = message.guild.settings.get(GuildSettings.CustomCommands);
		const tag = tags.some((t) => t.id === command);
		if (tag) return this.runTag(message, command);

		const aliases = message.guild.settings.get(GuildSettings.Trigger.Alias);
		const alias = aliases.find((entry) => entry.input === command);
		const commandAlias = (alias && this.client.commands.get(alias.output)) || null;
		if (commandAlias) return this.runCommand(message, commandAlias);

		return null;
	}

	public runCommand(message: KlasaMessage, command: Command) {
		const commandHandler = cast<CommandHandler>(this.client.monitors.get('commandHandler'));
		message.command = command;
		Reflect.set(
			message,
			'prompter',
			message.command.usage.createPrompt(message, {
				flagSupport: message.command.flagSupport,
				quotedStringSupport: message.command.quotedStringSupport,
				time: message.command.promptTime,
				limit: message.command.promptLimit
			})
		);
		return commandHandler.runCommand(message);
	}

	public async runTag(message: KlasaMessage, command: string) {
		const tagCommand = this.client.commands.get('tag') as TagCommand;
		const timer = new Stopwatch();

		try {
			await this.client.inhibitors.run(message, tagCommand);
			try {
				const commandRun = tagCommand.show(message, [command]);
				timer.stop();
				const response = await commandRun;
				floatPromise(this, this.client.finalizers.run(message, tagCommand, response, timer));
				this.client.emit(Events.CommandSuccess, message, tagCommand, ['show', command], response);
			} catch (error) {
				this.client.emit(Events.CommandError, message, tagCommand, ['show', command], error);
			}
		} catch (response) {
			this.client.emit(Events.CommandInhibited, message, tagCommand, response);
		}
	}
}

interface TagCommand extends SkyraCommand {
	add(message: KlasaMessage, args: [string, string]): Promise<KlasaMessage>;
	remove(message: KlasaMessage, args: [string]): Promise<KlasaMessage>;
	edit(message: KlasaMessage, args: [string, string]): Promise<KlasaMessage>;
	list(message: KlasaMessage): Promise<KlasaMessage>;
	show(message: KlasaMessage, args: [string]): Promise<KlasaMessage>;
	source(message: KlasaMessage, args: [string]): Promise<KlasaMessage>;
}
