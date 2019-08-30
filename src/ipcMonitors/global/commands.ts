import { IPCMonitor } from '../../lib/structures/IPCMonitor';
import { Events } from '../../lib/types/Enums';

export default class extends IPCMonitor {

	public run({ category = null, lang = 'en-US' }: VezaCommandData = {}) {
		try {
			const language = this.client.languages.get(lang) || this.client.languages.default;
			const commands = (category ? this.client.commands.filter(cmd => cmd.category === category) : this.client.commands).filter(cmd => cmd.permissionLevel < 9);
			const serializedCommands = commands.map(cmd => ({
				bucket: cmd.bucket,
				category: cmd.category,
				cooldown: cmd.cooldown,
				description: typeof cmd.description === 'function' ? cmd.description(language) : cmd.description,
				guarded: cmd.guarded,
				guildOnly: !cmd.runIn.includes('dm'),
				name: cmd.name,
				permissionLevel: cmd.permissionLevel,
				requiredPermissions: cmd.requiredPermissions.toArray(),
				usage: cmd.usageString
			}));
			return serializedCommands;
		} catch (error) {
			this.client.emit(Events.Wtf, error);
		}
	}

}

interface VezaCommandData {
	category?: string | null;
	lang?: string;
}
