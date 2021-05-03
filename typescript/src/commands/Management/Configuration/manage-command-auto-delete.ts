import { GuildSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import { PermissionLevels } from '#lib/types/Enums';
import { ApplyOptions } from '@sapphire/decorators';
import { Time } from '@sapphire/time-utilities';
import { codeBlock } from '@sapphire/utilities';
import type { TextChannel } from 'discord.js';

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['mcad'],
	bucket: 2,
	cooldown: 10,
	description: LanguageKeys.Commands.Management.ManageCommandAutoDeleteDescription,
	extendedHelp: LanguageKeys.Commands.Management.ManageCommandAutoDeleteExtended,
	permissionLevel: PermissionLevels.Administrator,
	runIn: ['text', 'news'],
	subCommands: ['add', 'remove', 'reset', { input: 'show', default: true }]
})
export class UserCommand extends SkyraCommand {
	public async add(message: GuildMessage, args: SkyraCommand.Args) {
		const channel = await args.pick('textChannelName');
		const time = await args.pick('timespan', { minimum: Time.Second, maximum: Time.Minute * 2 });
		const duration = Math.round(time / Time.Second);
		await message.guild.writeSettings((settings) => {
			const commandAutoDelete = settings[GuildSettings.CommandAutoDelete];
			const index = commandAutoDelete.findIndex(([id]) => id === channel.id);
			const value: readonly [string, number] = [channel.id, duration];

			if (index === -1) commandAutoDelete.push(value);
			else commandAutoDelete[index] = value;
		});

		return message.send(args.t(LanguageKeys.Commands.Management.ManageCommandAutoDeleteAdd, { channel: channel.toString(), time: duration }));
	}

	public async remove(message: GuildMessage, args: SkyraCommand.Args) {
		const channel = await args.pick('textChannelName');
		await message.guild.writeSettings((settings) => {
			const commandAutoDelete = settings[GuildSettings.CommandAutoDelete];
			const index = commandAutoDelete.findIndex(([id]) => id === channel.id);

			if (index === -1) {
				this.error(LanguageKeys.Commands.Management.ManageCommandAutoDeleteRemoveNotSet, { channel: channel.toString() });
			}

			commandAutoDelete.splice(index, 1);
		});

		return message.send(args.t(LanguageKeys.Commands.Management.ManageCommandAutoDeleteRemove, { channel: channel.toString() }));
	}

	public async reset(message: GuildMessage, args: SkyraCommand.Args) {
		await message.guild.writeSettings([[GuildSettings.CommandAutoDelete, []]]);
		return message.send(args.t(LanguageKeys.Commands.Management.ManageCommandAutoDeleteReset));
	}

	public async show(message: GuildMessage, args: SkyraCommand.Args) {
		const commandAutoDelete = await message.guild.readSettings(GuildSettings.CommandAutoDelete);
		if (!commandAutoDelete.length) this.error(LanguageKeys.Commands.Management.ManageCommandAutoDeleteShowEmpty);

		const list: string[] = [];
		for (const entry of commandAutoDelete) {
			const channel = this.context.client.channels.cache.get(entry[0]) as TextChannel;
			if (channel) list.push(`${channel.name.padEnd(26)} :: ${args.t(LanguageKeys.Globals.DurationValue, { value: entry[1] * Time.Second })}`);
		}
		if (!list.length) this.error(LanguageKeys.Commands.Management.ManageCommandAutoDeleteShowEmpty);
		return message.send(
			args.t(LanguageKeys.Commands.Management.ManageCommandAutoDeleteShow, { codeblock: codeBlock('asciidoc', list.join('\n')) })
		);
	}
}
