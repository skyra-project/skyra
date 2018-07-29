const { Command } = require('../../../index');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			bucket: 2,
			cooldown: 10,
			description: (msg) => msg.language.get('COMMAND_MANAGECOMMANDCHANNEL_DESCRIPTION'),
			extendedHelp: (msg) => msg.language.get('COMMAND_MANAGECOMMANDCHANNEL_EXTENDED'),
			permissionLevel: 6,
			runIn: ['text'],
			usage: '<show|add|remove|reset> [channel:channel] (command:command)',
			usageDelim: ' ',
			subcommands: true
		});

		this.createCustomResolver('channel', async (arg, possible, msg) => {
			if (!arg) return msg.channel;
			const channel = await this.client.arguments.get('channelname').run(arg, possible, msg);
			if (channel.type === 'text') return channel;
			throw msg.language.get('COMMAND_MANAGECOMMANDCHANNEL_TEXTCHANNEL');
		}).createCustomResolver('command', async (arg, possible, msg, [type]) => {
			if (type === 'show' || type === 'reset') return undefined;
			if (arg) {
				const command = await this.client.arguments.get('command').run(arg, possible, msg);
				if (!command.disabled && command.permissionLevel < 9) return command;
			}
			throw msg.language.get('COMMAND_MANAGECOMMANDCHANNEL_REQUIRED_COMMAND');
		});
	}

	async show(msg, [channel]) {
		const disabledCommands = msg.guild.configs.disabledCommandsChannels[channel.id];
		if (disabledCommands && disabledCommands.length) return msg.sendLocale('COMMAND_MANAGECOMMANDCHANNEL_SHOW', [channel, `\`${disabledCommands.join('` | `')}\``]);
		throw msg.language.get('COMMAND_MANAGECOMMANDCHANNEL_SHOW_EMPTY');
	}

	async add(msg, [channel, command]) {
		const disabledCommands = msg.guild.configs.disabledCommandsChannels[channel.id] || [];
		if (disabledCommands.include(command.name)) throw msg.language.get('COMMAND_MANAGECOMMANDCHANNEL_ADD_ALREADYSET');
		await msg.guild.configs.update('disabledCommandsChannels', {
			...msg.guild.configs.disabledCommandsChannels,
			[channel.id]: disabledCommands.concat(command.name)
		});
		return msg.sendLocale('COMMAND_MANAGECOMMANDCHANNEL_ADD', [channel, command.name]);
	}

	async remove(msg, [channel, command]) {
		const disabledCommands = msg.guild.configs.disabledCommandsChannels[channel.id] || [];
		if (!disabledCommands.include(command.name)) throw msg.language.get('COMMAND_MANAGECOMMANDCHANNEL_REMOVE_NOTSET', channel);
		await msg.guild.configs.update('disabledCommandsChannels', getRemovedObject(msg.guild.configs.disabledCommandsChannels, channel, command));
		return msg.sendLocale('COMMAND_MANAGECOMMANDCHANNEL_REMOVE', [channel, command.name]);
	}

	async reset(msg, [channel]) {
		const disabledCommands = msg.guild.configs.disabledCommandsChannels[channel.id];
		if (!disabledCommands) throw msg.language.get('COMMAND_MANAGECOMMANDCHANNEL_RESET_EMPTY');
		delete msg.guild.configs.disabledCommandsChannels[channel.id];
		await msg.guild.configs.update('disabledCommandsChannels', { ...msg.guild.configs.disabledCommandsChannels });
		return msg.sendLocale('COMMAND_MANAGECOMMANDCHANNEL_RESET', [channel]);
	}

};

function getRemovedObject(all, channel, command) {
	const disabledCommands = all[channel.id];
	if (disabledCommands.length > 1) {
		delete all[channel.id];
		return { ...all };
	}
	const commands = disabledCommands.slice().splice(disabledCommands.indexOf(command.name), 1);
	return { ...all, [channel.id]: commands };
}
