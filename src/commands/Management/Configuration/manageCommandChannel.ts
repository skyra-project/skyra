import { Command } from '../../../index';

export default class extends Command {

	public constructor(client: Client, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			bucket: 2,
			cooldown: 10,
			description: (language) => language.get('COMMAND_MANAGECOMMANDCHANNEL_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_MANAGECOMMANDCHANNEL_EXTENDED'),
			permissionLevel: 6,
			runIn: ['text'],
			usage: '<show|add|remove|reset> (channel:channel) (command:command)',
			usageDelim: ' ',
			subcommands: true
		});

		this.createCustomResolver('channel', async(arg, possible, msg) => {
			if (!arg) return msg.channel;
			const channel = await this.client.arguments.get('channelname').run(arg, possible, msg);
			if (channel.type === 'text') return channel;
			throw msg.language.get('COMMAND_MANAGECOMMANDCHANNEL_TEXTCHANNEL');
		}).createCustomResolver('command', async(arg, possible, msg, [type]) => {
			if (type === 'show' || type === 'reset') return undefined;
			if (arg) {
				const command = await this.client.arguments.get('command').run(arg, possible, msg);
				if (!command.disabled && command.permissionLevel < 9) return command;
			}
			throw msg.language.get('COMMAND_MANAGECOMMANDCHANNEL_REQUIRED_COMMAND');
		});
	}

	public async show(msg, [channel]) {
		const disabledCommands = msg.guild.settings.disabledCommandsChannels[channel.id];
		if (disabledCommands && disabledCommands.length) return msg.sendLocale('COMMAND_MANAGECOMMANDCHANNEL_SHOW', [channel, `\`${disabledCommands.join('` | `')}\``]);
		throw msg.language.get('COMMAND_MANAGECOMMANDCHANNEL_SHOW_EMPTY');
	}

	public async add(msg, [channel, command]) {
		const disabledCommands = msg.guild.settings.disabledCommandsChannels[channel.id] || [];
		if (disabledCommands.includes(command.name)) throw msg.language.get('COMMAND_MANAGECOMMANDCHANNEL_ADD_ALREADYSET');
		await msg.guild.settings.update('disabledCommandsChannels', {
			...msg.guild.settings.disabledCommandsChannels,
			[channel.id]: disabledCommands.concat(command.name)
		});
		return msg.sendLocale('COMMAND_MANAGECOMMANDCHANNEL_ADD', [channel, command.name]);
	}

	public async remove(msg, [channel, command]) {
		const disabledCommands = msg.guild.settings.disabledCommandsChannels[channel.id] || [];
		if (!disabledCommands.includes(command.name)) throw msg.language.get('COMMAND_MANAGECOMMANDCHANNEL_REMOVE_NOTSET', channel);
		await msg.guild.settings.update('disabledCommandsChannels', getRemovedObject(msg.guild.settings.disabledCommandsChannels, channel, command));
		return msg.sendLocale('COMMAND_MANAGECOMMANDCHANNEL_REMOVE', [channel, command.name]);
	}

	public async reset(msg, [channel]) {
		const disabledCommands = msg.guild.settings.disabledCommandsChannels[channel.id];
		if (!disabledCommands) throw msg.language.get('COMMAND_MANAGECOMMANDCHANNEL_RESET_EMPTY');
		delete msg.guild.settings.disabledCommandsChannels[channel.id];
		await msg.guild.settings.update('disabledCommandsChannels', { ...msg.guild.settings.disabledCommandsChannels });
		return msg.sendLocale('COMMAND_MANAGECOMMANDCHANNEL_RESET', [channel]);
	}

}

function getRemovedObject(all, channel, command) {
	const disabledCommands = all[channel.id];
	if (disabledCommands.length > 1) {
		delete all[channel.id];
		return { ...all };
	}
	const commands = disabledCommands.slice().splice(disabledCommands.indexOf(command.name), 1);
	return { ...all, [channel.id]: commands };
}
