import { getFromId } from '#lib/customCommands';
import { GuildSettings, readSettings } from '#lib/database';
import type { GuildMessage } from '#lib/types';
import { isGuildMessage } from '#utils/common';
import { isModerator } from '#utils/functions';
import { Events, Listener, UnknownCommandPayload } from '@sapphire/framework';

export class UserListener extends Listener<typeof Events.UnknownCommand> {
	public async run({ message, commandPrefix, commandName }: UnknownCommandPayload) {
		if (!isGuildMessage(message)) return null;

		const [disabledChannels, tags] = await readSettings(message.guild, [GuildSettings.DisabledChannels, GuildSettings.CustomCommands]);

		if (tags.length === 0) return null;
		if (disabledChannels.includes(message.channel.id) && !(await isModerator(message.member))) return null;

		const name = commandName.toLowerCase();

		const tag = getFromId(name, tags);
		if (tag) return this.runCommand(message as GuildMessage, commandPrefix, 'tag', tag.id);

		return null;
	}

	private runCommand(message: GuildMessage, commandPrefix: string, commandName: string, suffix: string) {
		// Retrieve the command and validate:
		const command = this.container.stores.get('commands').get(commandName);
		if (!command) return;

		const prefixLess = message.content.slice(commandPrefix.length).trim();
		const spaceIndex = prefixLess.indexOf(' ');

		// Run the last stage before running the command:
		const rawParameters = spaceIndex === -1 ? '' : prefixLess.slice(spaceIndex + 1).trim();
		const parameters = rawParameters.length === 0 ? suffix : suffix.length === 0 ? rawParameters : `${suffix} ${rawParameters}`;
		message.client.emit(Events.PreCommandRun, { message, command, parameters, context: { commandName, commandPrefix, prefix: commandPrefix } });
	}
}
