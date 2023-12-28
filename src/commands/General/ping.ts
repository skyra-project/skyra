import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { ApplyOptions } from '@sapphire/decorators';
import { send } from '@sapphire/plugin-editable-commands';
import type { Message } from 'discord.js';

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['pong'],
	description: LanguageKeys.Commands.General.PingDescription,
	detailedDescription: LanguageKeys.Commands.General.PingExtended
})
export class UserCommand extends SkyraCommand {
	public override async messageRun(message: Message, args: SkyraCommand.Args) {
		const msg = await send(message, args.t(LanguageKeys.Commands.General.Ping));

		const content = args.t(LanguageKeys.Commands.General.PingPong, {
			diff: (msg.editedTimestamp || msg.createdTimestamp) - (message.editedTimestamp || message.createdTimestamp),
			ping: Math.round(this.container.client.ws.ping)
		});
		return send(message, content);
	}
}
