import { GuildSettings } from '#lib/database';
import { GuildMessage } from '#lib/types';
import { Event, Events } from '@sapphire/framework';

export default class extends Event {
	public async run(message: GuildMessage, name: string, prefix: string) {
		if (!message.guild) return null;

		const [disabledChannels, tags, aliases] = await message.guild.readSettings([
			GuildSettings.DisabledChannels,
			GuildSettings.CustomCommands,
			GuildSettings.Trigger.Alias
		]);

		if (disabledChannels.includes(message.channel.id) && !(await message.member.isModerator())) return null;

		name = name.toLowerCase();

		const tag = tags.some((t) => t.id === name);
		if (tag) return this.runCommand(message, prefix, 'tag', name);

		const alias = aliases.find((entry) => entry.input === name);
		if (alias) return this.runCommand(message, prefix, alias.output, '');

		return null;
	}

	private runCommand(message: GuildMessage, prefix: string, name: string, suffix: string) {
		// Retrieve the command and validate:
		const command = this.context.stores.get('commands').get(name);
		if (!command) return;

		const prefixLess = message.content.slice(prefix.length).trim();
		const spaceIndex = prefixLess.indexOf(' ');

		// Run the last stage before running the command:
		const rawParameters = spaceIndex === -1 ? '' : prefixLess.substr(spaceIndex + 1).trim();
		const parameters = rawParameters.length === 0 ? suffix : suffix.length === 0 ? rawParameters : `${suffix} ${rawParameters}`;
		message.client.emit(Events.PreCommandRun, { message, command, parameters, context: { commandName: name, prefix } });
	}
}
