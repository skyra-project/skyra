import { GuildSettings } from '@lib/database';
import { SkyraCommand } from '@lib/structures/SkyraCommand';
import { GuildMessage } from '@lib/types';
import { PermissionLevels } from '@lib/types/Enums';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { TextChannel } from 'discord.js';
import { CommandStore } from 'klasa';

export default class extends SkyraCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			bucket: 2,
			cooldown: 10,
			description: (language) => language.get(LanguageKeys.Commands.Management.ManageCommandChannelDescription),
			extendedHelp: (language) => language.get(LanguageKeys.Commands.Management.ManageCommandChannelExtended),
			permissionLevel: PermissionLevels.Administrator,
			runIn: ['text'],
			subcommands: true,
			usage: '<show|add|remove|reset> (channel:channel) (command:command)',
			usageDelim: ' '
		});

		this.createCustomResolver('channel', async (arg, possible, msg) => {
			if (!arg) return msg.channel;
			const channel = await this.client.arguments.get('channelname')!.run(arg, possible, msg);
			if (channel.type === 'text') return channel;
			throw msg.fetchLocale(LanguageKeys.Commands.Management.ManageCommandChannelTextChannel);
		}).createCustomResolver('command', async (arg, possible, msg, [type]) => {
			if (type === 'show' || type === 'reset') return undefined;
			if (arg) {
				const command = await this.client.arguments.get('command')!.run(arg, possible, msg);
				if (!command.disabled && command.permissionLevel < 9) return command;
			}
			throw msg.fetchLocale(LanguageKeys.Commands.Management.ManageCommandChannelRequiredCommand);
		});
	}

	public async show(message: GuildMessage, [channel]: [TextChannel]) {
		const disabledCommandsChannels = await message.guild.readSettings(GuildSettings.DisabledCommandChannels);
		const entry = disabledCommandsChannels.find((e) => e.channel === channel.id);
		if (entry && entry.commands.length) {
			return message.sendLocale(LanguageKeys.Commands.Management.ManageCommandChannelShow, [
				{ channel: channel.toString(), commands: `\`${entry.commands.join('` | `')}\`` }
			]);
		}
		throw await message.fetchLocale(LanguageKeys.Commands.Management.ManageCommandChannelShowEmpty);
	}

	public async add(message: GuildMessage, [channel, command]: [TextChannel, SkyraCommand]) {
		await message.guild.writeSettings((settings) => {
			const disabledCommandsChannels = settings[GuildSettings.DisabledCommandChannels];
			const indexOfChannel = disabledCommandsChannels.findIndex((e) => e.channel === channel.id);
			const language = settings.getLanguage();

			if (indexOfChannel === -1) {
				settings[GuildSettings.DisabledCommandChannels].push({ channel: channel.id, commands: [command.name] });
			} else {
				const disabledCommandChannel = disabledCommandsChannels[indexOfChannel];
				if (disabledCommandChannel.commands.includes(command.name))
					throw language.get(LanguageKeys.Commands.Management.ManageCommandChannelAddAlreadyset);

				settings[GuildSettings.DisabledCommandChannels][indexOfChannel].commands.concat(command.name);
			}
		});

		return message.sendLocale(LanguageKeys.Commands.Management.ManageCommandChannelAdd, [{ channel: channel.toString(), command: command.name }]);
	}

	public async remove(message: GuildMessage, [channel, command]: [TextChannel, SkyraCommand]) {
		await message.guild.writeSettings((settings) => {
			const disabledCommandsChannels = settings[GuildSettings.DisabledCommandChannels];
			const indexOfChannel = disabledCommandsChannels.findIndex((e) => e.channel === channel.id);

			if (indexOfChannel !== -1) {
				const disabledCommandChannel = disabledCommandsChannels[indexOfChannel];
				const indexOfDisabledCommand = disabledCommandChannel.commands.indexOf(command.name);

				if (indexOfDisabledCommand !== -1) {
					if (disabledCommandChannel.commands.length > 1) {
						settings[GuildSettings.DisabledCommandChannels][indexOfChannel].commands.splice(indexOfDisabledCommand, 1);
					} else {
						settings[GuildSettings.DisabledCommandChannels].splice(indexOfChannel, 1);
					}
				}
			}

			throw settings.getLanguage().get(LanguageKeys.Commands.Management.ManageCommandChannelRemoveNotset, { channel: channel.toString() });
		});
	}

	public async reset(message: GuildMessage, [channel]: [TextChannel]) {
		try {
			await message.guild.writeSettings((settings) => {
				const disabledCommandsChannels = settings[GuildSettings.DisabledCommandChannels];
				const entryIndex = disabledCommandsChannels.findIndex((e) => e.channel === channel.id);

				if (entryIndex !== -1) {
					settings[GuildSettings.DisabledCommandChannels].splice(entryIndex, 1);
				}
			});

			return message.sendLocale(LanguageKeys.Commands.Management.ManageCommandChannelReset, [{ channel: channel.toString() }]);
		} catch {
			throw await message.fetchLocale(LanguageKeys.Commands.Management.ManageCommandChannelResetEmpty);
		}
	}
}
