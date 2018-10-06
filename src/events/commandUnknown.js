const { Event, Stopwatch } = require('../index');

module.exports = class extends Event {

	async run(message, command) {
		if (!message.guild || message.guild.settings.disabledChannels.includes(message.channel.id)) return null;
		command = command.toLowerCase();

		const tag = message.guild.settings.tags.some((t) => t[0] === command);
		if (tag) return this.runTag(message, command);

		const alias = message.guild.settings.trigger.alias.find(entry => entry.input === command);
		const commandAlias = (alias && this.client.commands.get(alias.output)) || null;
		if (commandAlias) return this.runCommand(message, commandAlias);

		return null;
	}

	async runCommand(message, command) {
		const commandHandler = this.client.monitors.get('commandHandler');
		const { regex: prefix, length: prefixLength } = commandHandler.getPrefix(message);

		return commandHandler.runCommand(message._registerCommand({ command, prefix, prefixLength }));
	}

	async runTag(message, command) {
		const tagCommand = this.client.commands.get('tag');
		const timer = new Stopwatch();

		try {
			await this.client.inhibitors.run(message, tagCommand);
			try {
				const commandRun = tagCommand.show(message, [command]);
				timer.stop();
				const response = await commandRun;
				this.client.finalizers.run(message, tagCommand, response, timer);
				this.client.emit('commandSuccess', message, tagCommand, ['show', command], response);
			} catch (error) {
				this.client.emit('commandError', message, tagCommand, ['show', command], error);
			}
		} catch (response) {
			this.client.emit('commandInhibited', message, tagCommand, response);
		}
	}

};
