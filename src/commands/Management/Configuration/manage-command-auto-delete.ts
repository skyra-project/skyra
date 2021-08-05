import { GuildSettings, readSettings, writeSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import { PermissionLevels } from '#lib/types/Enums';
import { ApplyOptions } from '@sapphire/decorators';
import type { GuildTextBasedChannelTypes } from '@sapphire/discord.js-utilities';
import { Time } from '@sapphire/time-utilities';
import { codeBlock } from '@sapphire/utilities';
import { send } from '@skyra/editable-commands';

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['mcad'],
	description: LanguageKeys.Commands.Management.ManageCommandAutoDeleteDescription,
	extendedHelp: LanguageKeys.Commands.Management.ManageCommandAutoDeleteExtended,
	permissionLevel: PermissionLevels.Administrator,
	runIn: ['GUILD_ANY'],
	subCommands: ['add', 'remove', 'reset', { input: 'show', default: true }]
})
export class UserCommand extends SkyraCommand {
	public async add(message: GuildMessage, args: SkyraCommand.Args) {
		const channel = await args.pick('textChannelName');
		const time = await args.pick('timespan', { minimum: Time.Second, maximum: Time.Minute * 2 });

		await writeSettings(message.guild, (settings) => {
			const commandAutoDelete = settings[GuildSettings.CommandAutoDelete];
			const index = commandAutoDelete.findIndex(([id]) => id === channel.id);
			const value: readonly [string, number] = [channel.id, time];

			if (index === -1) commandAutoDelete.push(value);
			else commandAutoDelete[index] = value;
		});

		const content = args.t(LanguageKeys.Commands.Management.ManageCommandAutoDeleteAdd, { channel: channel.toString(), time });
		return send(message, content);
	}

	public async remove(message: GuildMessage, args: SkyraCommand.Args) {
		const channel = await args.pick('textChannelName');
		await writeSettings(message.guild, (settings) => {
			const commandAutoDelete = settings[GuildSettings.CommandAutoDelete];
			const index = commandAutoDelete.findIndex(([id]) => id === channel.id);

			if (index === -1) {
				this.error(LanguageKeys.Commands.Management.ManageCommandAutoDeleteRemoveNotSet, { channel: channel.toString() });
			}

			commandAutoDelete.splice(index, 1);
		});

		const content = args.t(LanguageKeys.Commands.Management.ManageCommandAutoDeleteRemove, { channel: channel.toString() });
		return send(message, content);
	}

	public async reset(message: GuildMessage, args: SkyraCommand.Args) {
		await writeSettings(message.guild, [[GuildSettings.CommandAutoDelete, []]]);

		const content = args.t(LanguageKeys.Commands.Management.ManageCommandAutoDeleteReset);
		return send(message, content);
	}

	public async show(message: GuildMessage, args: SkyraCommand.Args) {
		const commandAutoDelete = await readSettings(message.guild, GuildSettings.CommandAutoDelete);
		if (!commandAutoDelete.length) this.error(LanguageKeys.Commands.Management.ManageCommandAutoDeleteShowEmpty);

		const list: string[] = [];
		for (const entry of commandAutoDelete) {
			const channel = this.container.client.channels.cache.get(entry[0]) as GuildTextBasedChannelTypes;
			if (channel) list.push(`${channel.name.padEnd(26)} :: ${args.t(LanguageKeys.Globals.DurationValue, { value: entry[1] * Time.Second })}`);
		}
		if (!list.length) this.error(LanguageKeys.Commands.Management.ManageCommandAutoDeleteShowEmpty);

		const content = args.t(LanguageKeys.Commands.Management.ManageCommandAutoDeleteShow, { codeblock: codeBlock('asciidoc', list.join('\n')) });
		return send(message, content);
	}
}
