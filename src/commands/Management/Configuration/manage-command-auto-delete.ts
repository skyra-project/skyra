import { readSettings, writeSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraSubcommand } from '#lib/structures';
import { PermissionLevels, type GuildMessage } from '#lib/types';
import { minutes, seconds } from '#utils/common';
import { ApplyOptions } from '@sapphire/decorators';
import type { GuildTextBasedChannelTypes } from '@sapphire/discord.js-utilities';
import { CommandOptionsRunTypeEnum } from '@sapphire/framework';
import { send } from '@sapphire/plugin-editable-commands';
import { codeBlock } from '@sapphire/utilities';

@ApplyOptions<SkyraSubcommand.Options>({
	aliases: ['mcad'],
	description: LanguageKeys.Commands.Management.ManageCommandAutoDeleteDescription,
	detailedDescription: LanguageKeys.Commands.Management.ManageCommandAutoDeleteExtended,
	permissionLevel: PermissionLevels.Administrator,
	runIn: [CommandOptionsRunTypeEnum.GuildAny],
	subcommands: [
		{ name: 'add', messageRun: 'add' },
		{ name: 'remove', messageRun: 'remove' },
		{ name: 'reset', messageRun: 'reset' },
		{ name: 'show', messageRun: 'show', default: true }
	]
})
export class UserCommand extends SkyraSubcommand {
	public async add(message: GuildMessage, args: SkyraSubcommand.Args) {
		const channel = await args.pick('textChannelName');
		const time = await args.pick('timespan', { minimum: seconds(1), maximum: minutes(2) });

		await writeSettings(message.guild, (settings) => {
			const { commandAutoDelete } = settings;
			const index = commandAutoDelete.findIndex(([id]) => id === channel.id);
			const value: readonly [string, number] = [channel.id, time];

			if (index === -1) commandAutoDelete.push(value);
			else commandAutoDelete[index] = value;
		});

		const content = args.t(LanguageKeys.Commands.Management.ManageCommandAutoDeleteAdd, { channel: channel.toString(), time });
		return send(message, content);
	}

	public async remove(message: GuildMessage, args: SkyraSubcommand.Args) {
		const channel = await args.pick('textChannelName');
		await writeSettings(message.guild, (settings) => {
			const { commandAutoDelete } = settings;
			const index = commandAutoDelete.findIndex(([id]) => id === channel.id);

			if (index === -1) {
				this.error(LanguageKeys.Commands.Management.ManageCommandAutoDeleteRemoveNotSet, { channel: channel.toString() });
			}

			commandAutoDelete.splice(index, 1);
		});

		const content = args.t(LanguageKeys.Commands.Management.ManageCommandAutoDeleteRemove, { channel: channel.toString() });
		return send(message, content);
	}

	public async reset(message: GuildMessage, args: SkyraSubcommand.Args) {
		await writeSettings(message.guild, [['commandAutoDelete', []]]);

		const content = args.t(LanguageKeys.Commands.Management.ManageCommandAutoDeleteReset);
		return send(message, content);
	}

	public async show(message: GuildMessage, args: SkyraSubcommand.Args) {
		const settings = await readSettings(message.guild);

		const { commandAutoDelete } = settings;
		if (!commandAutoDelete.length) this.error(LanguageKeys.Commands.Management.ManageCommandAutoDeleteShowEmpty);

		const list: string[] = [];
		for (const entry of commandAutoDelete) {
			const channel = this.container.client.channels.cache.get(entry[0]) as GuildTextBasedChannelTypes;
			if (channel) list.push(`${channel.name.padEnd(26)} :: ${args.t(LanguageKeys.Globals.DurationValue, { value: seconds(entry[1]) })}`);
		}
		if (!list.length) this.error(LanguageKeys.Commands.Management.ManageCommandAutoDeleteShowEmpty);

		const content = args.t(LanguageKeys.Commands.Management.ManageCommandAutoDeleteShow, { codeblock: codeBlock('asciidoc', list.join('\n')) });
		return send(message, content);
	}
}
