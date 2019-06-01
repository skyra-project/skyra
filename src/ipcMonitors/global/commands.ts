import { IPCMonitor } from '../../lib/structures/IPCMonitor';
import { Events } from '../../lib/types/Enums';

export default class extends IPCMonitor {

	public run({ category = null, lang = 'en-US' }: any = {}) {
		try {
			const language = this.client.languages.get(lang) || this.client.languages.default;
			const commands = (category ? this.client.commands.filter(cmd => cmd.category === category) : this.client.commands).filter(cmd => cmd.permissionLevel < 9);
			const serializedCommands = commands.map(cmd => ({
				bucket: cmd.bucket,
				cooldown: cmd.cooldown,
				description: typeof cmd.description === 'function' ? cmd.description(language) : cmd.description,
				extendedHelp: typeof cmd.extendedHelp === 'function' ? cmd.extendedHelp(language) : cmd.extendedHelp,
				guildOnly: !cmd.runIn.includes('dm'),
				name: cmd.name,
				category: cmd.category,
				requiredPermissions: cmd.requiredPermissions.toArray(),
				permissionLevel: cmd.permissionLevel,
				usage: cmd.usageString
			}));
			return serializedCommands;
		} catch (error) {
			this.client.emit(Events.Wtf, error);
		}
	}

}
