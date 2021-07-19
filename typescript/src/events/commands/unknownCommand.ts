import { getFromID } from '#lib/customCommands';
import { GuildSettings, readSettings } from '#lib/database';
import type { GuildMessage } from '#lib/types';
import { Event, Events, UnknownCommandPayload } from '@sapphire/framework';

export class UserEvent extends Event<Events.UnknownCommand> {
	public async run({ message, commandPrefix, commandName }: UnknownCommandPayload) {
		if (!message.guild) return null;

		const [disabledChannels, tags, aliases] = await readSettings(message.guild, [
			GuildSettings.DisabledChannels,
			GuildSettings.CustomCommands,
			GuildSettings.Trigger.Alias
		]);

		if (tags.length === 0 && aliases.length === 0) return null;
		if (disabledChannels.includes(message.channel.id) && !(await message.member!.isModerator())) return null;

		const name = commandName.toLowerCase();

		const tag = getFromID(name, tags);
		if (tag) return this.runCommand(message as GuildMessage, commandPrefix, 'tag', tag.id);

		const alias = aliases.find((entry) => entry.input === name);
		if (alias) return this.runCommand(message as GuildMessage, commandPrefix, alias.output, '');

		return null;
	}

	private runCommand(message: GuildMessage, commandPrefix: string, commandName: string, suffix: string) {
		// Retrieve the command and validate:
		const command = this.context.stores.get('commands').get(commandName);
		if (!command) return;

		const prefixLess = message.content.slice(commandPrefix.length).trim();
		const spaceIndex = prefixLess.indexOf(' ');

		// Run the last stage before running the command:
		const rawParameters = spaceIndex === -1 ? '' : prefixLess.substr(spaceIndex + 1).trim();
		const parameters = rawParameters.length === 0 ? suffix : suffix.length === 0 ? rawParameters : `${suffix} ${rawParameters}`;
		message.client.emit(Events.PreCommandRun, { message, command, parameters, context: { commandName, commandPrefix, prefix: commandPrefix } });
	}
}
