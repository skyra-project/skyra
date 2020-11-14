import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { Command, Inhibitor, KlasaMessage } from 'klasa';

export default class extends Inhibitor {
	public async run(message: KlasaMessage, command: Command) {
		// If this command is being used outside of a guild context then always allow it
		if (!message.guild || !message.member) return;

		const [pnodes, language] = await message.guild.readSettings((settings) => [settings.permissionNodes, settings.getLanguage()]);

		// If the message was sent in a guild, the command isn't guarded (they are all 0, and
		// cannot be denied), and the permission level is lower than 9, run the permission nodes.
		if (message.guild && message.author.id !== message.guild.ownerID && !command.guarded && command.permissionLevel < 9) {
			const result = pnodes.run(message.member, command.name);
			if (result) return;
			if (result === false) throw language.get(LanguageKeys.Inhibitors.Permissions);
		}

		const { broke, permission } = await this.client.permissionLevels.run(message, command.permissionLevel);
		if (permission) return;

		throw broke ? language.get(LanguageKeys.Inhibitors.Permissions) : true;
	}
}
