import { TextChannel } from 'discord.js';
import { CommandStore, KlasaMessage, SettingsFolderUpdateResult } from 'klasa';
import { SkyraCommand } from '../../../lib/structures/SkyraCommand';
import { GuildSettings } from '../../../lib/types/settings/GuildSettings';

export default class extends SkyraCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			bucket: 2,
			cooldown: 10,
			description: language => language.tget('COMMAND_MANAGECOMMANDCHANNEL_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_MANAGECOMMANDCHANNEL_EXTENDED'),
			permissionLevel: 6,
			runIn: ['text'],
			subcommands: true,
			usage: '<show|add|remove|reset> (channel:channel) (command:command)',
			usageDelim: ' '
		});

		this.createCustomResolver('channel', async (arg, possible, msg) => {
			if (!arg) return msg.channel;
			const channel = await this.client.arguments.get('channelname').run(arg, possible, msg);
			if (channel.type === 'text') return channel;
			throw msg.language.tget('COMMAND_MANAGECOMMANDCHANNEL_TEXTCHANNEL');
		}).createCustomResolver('command', async (arg, possible, msg, [type]) => {
			if (type === 'show' || type === 'reset') return undefined;
			if (arg) {
				const command = await this.client.arguments.get('command').run(arg, possible, msg);
				if (!command.disabled && command.permissionLevel < 9) return command;
			}
			throw msg.language.tget('COMMAND_MANAGECOMMANDCHANNEL_REQUIRED_COMMAND');
		});
	}

	public async show(message: KlasaMessage, [channel]: [TextChannel]) {
		const disabledCommandsChannels = message.guild!.settings.get(GuildSettings.DisabledCommandChannels);
		const entry = disabledCommandsChannels.find(e => e.channel === channel.id);
		if (entry && entry.commands.length) {
			return message.sendLocale('COMMAND_MANAGECOMMANDCHANNEL_SHOW', [channel, `\`${entry.commands.join('` | `')}\``]);
		}
		throw message.language.tget('COMMAND_MANAGECOMMANDCHANNEL_SHOW_EMPTY');
	}

	public async add(message: KlasaMessage, [channel, command]: [TextChannel, SkyraCommand]) {
		const disabledCommandsChannels = message.guild!.settings.get(GuildSettings.DisabledCommandChannels);
		const index = disabledCommandsChannels.findIndex(e => e.channel === channel.id);

		if (index === -1) {
			await message.guild!.settings.update(GuildSettings.DisabledCommandChannels, {
				channel: channel.id,
				commands: [command.name]
			}, { arrayAction: 'add' });
		} else {
			const entry = disabledCommandsChannels[index];
			if (entry.commands.includes(command.name)) throw message.language.tget('COMMAND_MANAGECOMMANDCHANNEL_ADD_ALREADYSET');

			await message.guild!.settings.update(GuildSettings.DisabledCommandChannels, {
				channel: entry.channel,
				commands: entry.commands.concat(command.name)
			}, { arrayIndex: index });
		}
		return message.sendLocale('COMMAND_MANAGECOMMANDCHANNEL_ADD', [channel, command.name]);
	}

	public async remove(message: KlasaMessage, [channel, command]: [TextChannel, SkyraCommand]) {
		const disabledCommandsChannels = message.guild!.settings.get(GuildSettings.DisabledCommandChannels);
		const index = disabledCommandsChannels.findIndex(e => e.channel === channel.id);

		if (index !== -1) {
			const entry = disabledCommandsChannels[index];
			const commandIndex = entry.commands.indexOf(command.name);
			if (commandIndex !== -1) {
				let results: SettingsFolderUpdateResult;
				if (entry.commands.length > 1) {
					const clone = entry.commands.slice();
					clone.splice(commandIndex, 1);
					results = await message.guild!.settings.update(GuildSettings.DisabledCommandChannels, {
						channel: entry.channel,
						commands: clone
					});
				} else {
					results = await message.guild!.settings.update(GuildSettings.DisabledCommandChannels, entry, { arrayAction: 'remove' });
				}

				if (results.errors.length) throw String(results.errors[0]);
				return message.sendLocale('COMMAND_MANAGECOMMANDCHANNEL_REMOVE', [channel, command.name]);
			}
		}
		throw message.language.tget('COMMAND_MANAGECOMMANDCHANNEL_REMOVE_NOTSET', channel.toString());
	}

	public async reset(message: KlasaMessage, [channel]: [TextChannel]) {
		const disabledCommandsChannels = message.guild!.settings.get(GuildSettings.DisabledCommandChannels);
		const entry = disabledCommandsChannels.find(e => e.channel === channel.id);

		if (entry) {
			await message.guild!.settings.update(GuildSettings.DisabledCommandChannels, entry, { arrayAction: 'remove' });
			return message.sendLocale('COMMAND_MANAGECOMMANDCHANNEL_RESET', [channel]);
		}
		throw message.language.tget('COMMAND_MANAGECOMMANDCHANNEL_RESET_EMPTY');
	}

}
