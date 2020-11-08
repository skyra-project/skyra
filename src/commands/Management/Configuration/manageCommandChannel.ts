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
		const disabledCommandsChannels = await message.guild!.readSettings(GuildSettings.DisabledCommandChannels);
		const entry = disabledCommandsChannels.find((e) => e.channel === channel.id);
		if (entry && entry.commands.length) {
			return message.sendLocale(LanguageKeys.Commands.Management.ManageCommandChannelShow, [
				{ channel: channel.toString(), commands: `\`${entry.commands.join('` | `')}\`` }
			]);
		}
		throw message.fetchLocale(LanguageKeys.Commands.Management.ManageCommandChannelShowEmpty);
	}

	public async add(message: GuildMessage, [channel, command]: [TextChannel, SkyraCommand]) {
		const disabledCommandsChannels = await message.guild!.readSettings(GuildSettings.DisabledCommandChannels);
		const index = disabledCommandsChannels.findIndex((e) => e.channel === channel.id);

		if (index === -1) {
			await message.guild!.writeSettings((settings) => {
				settings[GuildSettings.DisabledCommandChannels].push({ channel: channel.id, commands: [command.name] });
				return settings.getLanguage();
			});
		} else {
			const entry = disabledCommandsChannels[index];
			if (entry.commands.includes(command.name)) throw message.fetchLocale(LanguageKeys.Commands.Management.ManageCommandChannelAddAlreadyset);

			await message.guild!.settings.update(
				GuildSettings.DisabledCommandChannels,
				{ channel: entry.channel, commands: entry.commands.concat(command.name) },
				{
					arrayIndex: index
				}
			);
		}
		return message.sendLocale(LanguageKeys.Commands.Management.ManageCommandChannelAdd, [{ channel: channel.toString(), command: command.name }]);
	}

	public async remove(message: GuildMessage, [channel, command]: [TextChannel, SkyraCommand]) {
		const disabledCommandsChannels = message.guild!.settings.get(GuildSettings.DisabledCommandChannels);
		const index = disabledCommandsChannels.findIndex((e) => e.channel === channel.id);

		if (index !== -1) {
			const entry = disabledCommandsChannels[index];
			const commandIndex = entry.commands.indexOf(command.name);
			if (commandIndex !== -1) {
				if (entry.commands.length > 1) {
					const clone = entry.commands.slice();
					clone.splice(commandIndex, 1);
					await message.guild!.settings.update(GuildSettings.DisabledCommandChannels, { channel: entry.channel, commands: clone });
				} else {
					await message.guild!.settings.update(GuildSettings.DisabledCommandChannels, entry, {
						arrayAction: 'remove'
					});
				}

				return message.sendLocale(LanguageKeys.Commands.Management.ManageCommandChannelRemove, [
					{ channel: channel.toString(), command: command.name }
				]);
			}
		}
		throw message.language.get(LanguageKeys.Commands.Management.ManageCommandChannelRemoveNotset, { channel: channel.toString() });
	}

	public async reset(message: GuildMessage, [channel]: [TextChannel]) {
		const disabledCommandsChannels = await message.guild!.readSettings(GuildSettings.DisabledCommandChannels);
		const entry = disabledCommandsChannels.find((e) => e.channel === channel.id);

		if (entry) {
			await message.guild!.settings.update(GuildSettings.DisabledCommandChannels, entry, {
				arrayAction: 'remove'
			});
			return message.sendLocale(LanguageKeys.Commands.Management.ManageCommandChannelReset, [{ channel: channel.toString() }]);
		}
		throw message.fetchLocale(LanguageKeys.Commands.Management.ManageCommandChannelResetEmpty);
	}
}
