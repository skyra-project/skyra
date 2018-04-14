const { API } = require('../../index');

module.exports = class extends API {

	run({ category = null, lang = 'en-US' }) {
		const language = { language: this.client.languages.get(lang) || this.client.languages.default };
		const commands = category ? this.client.commands.filter(cmd => cmd.category === category) : this.client.commands;
		return commands.map(cmd => ({
			bucket: cmd.bucket,
			cooldown: cmd.cooldown,
			description: typeof cmd.description === 'function' ? cmd.description(language) : cmd.description,
			extendedHelp: typeof cmd.extendedHelp === 'function' ? cmd.extendedHelp(language) : cmd.extendedHelp,
			guildOnly: !cmd.runIn.includes('dm'),
			name: cmd.name,
			permLevel: cmd.permLevel,
			usage: cmd.usageString
		}));
	}

};
