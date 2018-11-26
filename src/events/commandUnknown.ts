import { Command, Event, KlasaMessage, Stopwatch } from 'klasa';
import { GuildSettingsTriggerAlias } from '../lib/types/Misc';

export default class extends Event {

	public async run(message: KlasaMessage, command: string): Promise<any> {
		if (!message.guild || (message.guild.settings.get('disabledChannels') as string[]).includes(message.channel.id)) return null;
		command = command.toLowerCase();

		const tag = (message.guild.settings.get('tags') as [string, string][]).some((t) => t[0] === command);
		if (tag) return this.runTag(message, command);

		const alias = (message.guild.settings.get('trigger.alias') as GuildSettingsTriggerAlias).find((entry) => entry.input === command);
		const commandAlias = (alias && this.client.commands.get(alias.output)) || null;
		if (commandAlias) return this.runCommand(message, commandAlias);

		return null;
	}

	public runCommand(message: KlasaMessage, command: Command): Promise<any> {
		const commandHandler = this.client.monitors.get('commandHandler') as any;
		const { regex: prefix, length: prefixLength } = commandHandler.getPrefix(message);

		// @ts-ignore
		return commandHandler.runCommand(message._registerCommand({ command, prefix, prefixLength }));
	}

	public async runTag(message: KlasaMessage, command: string): Promise<any> {
		const tagCommand = this.client.commands.get('tag') as any;
		const timer = new Stopwatch();

		try {
			await this.client.inhibitors.run(message, tagCommand);
			try {
				const commandRun = tagCommand.show(message, [command]);
				timer.stop();
				const response = await commandRun;
				this.client.finalizers.run(message, tagCommand, response, timer);
				this.client.emit('commandSuccess', message, tagCommand, ['show', command], response);
			} catch (error) {
				this.client.emit('commandError', message, tagCommand, ['show', command], error);
			}
		} catch (response) {
			this.client.emit('commandInhibited', message, tagCommand, response);
		}
	}

}
