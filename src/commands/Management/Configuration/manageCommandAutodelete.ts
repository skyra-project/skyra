import { TextChannel } from 'discord.js';
import { CommandStore, KlasaMessage, util } from 'klasa';
import { SkyraCommand } from '../../../lib/structures/SkyraCommand';
import { GuildSettings } from '../../../lib/types/settings/GuildSettings';

export default class extends SkyraCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			bucket: 2,
			cooldown: 10,
			description: language => language.tget('COMMAND_MANAGECOMMANDAUTODELETE_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_MANAGECOMMANDAUTODELETE_EXTENDED'),
			permissionLevel: 6,
			runIn: ['text'],
			subcommands: true,
			usage: '<show|add|remove|reset> (channel:channel) (duration:timespan)',
			usageDelim: ' '
		});

		this.createCustomResolver('channel', async (arg, possible, msg, [type]) => {
			if (type === 'show' || type === 'reset') return undefined;
			if (!arg) return msg.channel;
			const channel = await this.client.arguments.get('channelname').run(arg, possible, msg);
			if (channel.type === 'text') return channel;
			throw msg.language.tget('COMMAND_MANAGECOMMANDAUTODELETE_TEXTCHANNEL');
		}).createCustomResolver('timespan', (arg, possible, msg, [type]) => type === 'add'
			? this.client.arguments.get('timespan').run(arg, possible, msg)
			: undefined);
	}

	public async show(message: KlasaMessage) {
		const commandAutodelete = message.guild!.settings.get(GuildSettings.CommandAutodelete);
		if (!commandAutodelete.length) throw message.language.tget('COMMAND_MANAGECOMMANDAUTODELETE_SHOW_EMPTY');

		const list: string[] = [];
		const { duration } = message.language;
		for (const entry of commandAutodelete) {
			const channel = this.client.channels.get(entry[0]) as TextChannel;
			if (channel) list.push(`${channel.name.padEnd(26)} :: ${duration(entry[1] / 60000)}`);
		}
		if (!list.length) throw message.language.tget('COMMAND_MANAGECOMMANDAUTODELETE_SHOW_EMPTY');
		return message.sendLocale('COMMAND_MANAGECOMMANDAUTODELETE_SHOW', [util.codeBlock('asciidoc', list.join('\n'))]);
	}

	public async add(message: KlasaMessage, [channel, duration]: [TextChannel, number]) {
		const commandAutodelete = message.guild!.settings.get(GuildSettings.CommandAutodelete);
		const index = commandAutodelete.findIndex(([id]) => id === channel.id);
		const value: readonly [string, number] = [channel.id, duration];

		if (index === -1) {
			await message.guild!.settings.update(GuildSettings.CommandAutodelete, [value], { arrayAction: 'add' });
		} else {
			await message.guild!.settings.update(GuildSettings.CommandAutodelete, value, { arrayIndex: index });
		}
		return message.sendLocale('COMMAND_MANAGECOMMANDAUTODELETE_ADD', [channel, duration]);
	}

	public async remove(message: KlasaMessage, [channel]: [TextChannel]) {
		const commandAutodelete = message.guild!.settings.get(GuildSettings.CommandAutodelete);
		const index = commandAutodelete.findIndex(([id]) => id === channel.id);

		if (index !== -1) {
			await message.guild!.settings.update(GuildSettings.CommandAutodelete, commandAutodelete[index], { arrayIndex: index });
			return message.sendLocale('COMMAND_MANAGECOMMANDAUTODELETE_REMOVE', [channel]);
		}
		throw message.language.tget('COMMAND_MANAGECOMMANDAUTODELETE_REMOVE_NOTSET', channel.toString());
	}

	public async reset(message: KlasaMessage) {
		await message.guild!.settings.reset(GuildSettings.CommandAutodelete);
		return message.sendLocale('COMMAND_MANAGECOMMANDAUTODELETE_RESET');
	}

}
