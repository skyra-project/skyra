import { IPCMonitor } from '../../lib/structures/IPCMonitor';

export default class extends IPCMonitor {

	public async run({ category = null, lang = 'en-US' }: any) {
		const language = this.client.languages.get(lang) || this.client.languages.default;
		const commands = category ? this.client.commands.filter((cmd) => cmd.category === category) : this.client.commands;
		return commands.map((cmd) => ({
			bucket: cmd.bucket,
			cooldown: cmd.cooldown,
			description: typeof cmd.description === 'function' ? cmd.description(language) : cmd.description,
			extendedHelp: typeof cmd.extendedHelp === 'function' ? cmd.extendedHelp(language) : cmd.extendedHelp,
			guildOnly: !cmd.runIn.includes('dm'),
			name: cmd.name,
			permissionLevel: cmd.permissionLevel,
			usage: cmd.usageString
		}));
	}

}
