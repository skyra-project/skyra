import { GuildSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import { PermissionLevels } from '#lib/types/Enums';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<SkyraCommand.Options>({
	bucket: 2,
	cooldown: 10,
	description: LanguageKeys.Commands.Management.ManageCommandChannelDescription,
	extendedHelp: LanguageKeys.Commands.Management.ManageCommandChannelExtended,
	permissionLevel: PermissionLevels.Administrator,
	runIn: ['text'],
	subCommands: ['add', 'remove', 'reset', { input: 'show', default: true }]
})
export class UserCommand extends SkyraCommand {
	public async add(message: GuildMessage, args: SkyraCommand.Args) {
		const channel = await args.pick('textChannelName');
		const command = await args.pick('command');
		await message.guild.writeSettings((settings) => {
			const disabledCommandsChannels = settings[GuildSettings.DisabledCommandChannels];
			const indexOfChannel = disabledCommandsChannels.findIndex((e) => e.channel === channel.id);

			if (indexOfChannel === -1) {
				settings[GuildSettings.DisabledCommandChannels].push({ channel: channel.id, commands: [command.name] });
			} else {
				const disabledCommandChannel = disabledCommandsChannels[indexOfChannel];
				if (disabledCommandChannel.commands.includes(command.name))
					throw args.t(LanguageKeys.Commands.Management.ManageCommandChannelAddAlreadySet);

				settings[GuildSettings.DisabledCommandChannels][indexOfChannel].commands.push(command.name);
			}
		});

		return message.send(args.t(LanguageKeys.Commands.Management.ManageCommandChannelAdd, { channel: channel.toString(), command: command.name }));
	}

	public async remove(message: GuildMessage, args: SkyraCommand.Args) {
		const channel = await args.pick('textChannelName');
		const command = await args.pick('command');
		await message.guild.writeSettings((settings) => {
			const disabledCommandsChannels = settings[GuildSettings.DisabledCommandChannels];
			const indexOfChannel = disabledCommandsChannels.findIndex((e) => e.channel === channel.id);

			if (indexOfChannel === -1) {
				throw args.t(LanguageKeys.Commands.Management.ManageCommandChannelRemoveNotSet, { channel: channel.toString() });
			}

			const disabledCommandChannel = disabledCommandsChannels[indexOfChannel];
			const indexOfDisabledCommand = disabledCommandChannel.commands.indexOf(command.name);

			if (indexOfDisabledCommand !== -1) {
				if (disabledCommandChannel.commands.length > 1) {
					settings[GuildSettings.DisabledCommandChannels][indexOfChannel].commands.splice(indexOfDisabledCommand, 1);
				} else {
					settings[GuildSettings.DisabledCommandChannels].splice(indexOfChannel, 1);
				}
			}
		});

		return message.send(
			args.t(LanguageKeys.Commands.Management.ManageCommandChannelRemove, { channel: channel.toString(), command: command.name })
		);
	}

	public async reset(message: GuildMessage, args: SkyraCommand.Args) {
		const channel = await args.pick('textChannelName');
		await message.guild.writeSettings((settings) => {
			const disabledCommandsChannels = settings[GuildSettings.DisabledCommandChannels];
			const entryIndex = disabledCommandsChannels.findIndex((e) => e.channel === channel.id);

			if (entryIndex === -1) {
				throw args.t(LanguageKeys.Commands.Management.ManageCommandChannelResetEmpty);
			}

			settings[GuildSettings.DisabledCommandChannels].splice(entryIndex, 1);
		});

		return message.send(args.t(LanguageKeys.Commands.Management.ManageCommandChannelReset, { channel: channel.toString() }));
	}

	public async show(message: GuildMessage, args: SkyraCommand.Args) {
		const channel = await args.pick('textChannelName');
		const disabledCommandsChannels = await message.guild.readSettings(GuildSettings.DisabledCommandChannels);

		const entry = disabledCommandsChannels.find((e) => e.channel === channel.id);
		if (entry?.commands.length) {
			return message.send(
				args.t(LanguageKeys.Commands.Management.ManageCommandChannelShow, {
					channel: channel.toString(),
					commands: `\`${entry.commands.join('` | `')}\``
				})
			);
		}

		throw args.t(LanguageKeys.Commands.Management.ManageCommandChannelShowEmpty);
	}
}
