import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { ApplyOptions } from '@sapphire/decorators';
import type { Message } from 'discord.js';

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['pong'],
	cooldown: 5,
	description: LanguageKeys.Commands.General.PingDescription,
	extendedHelp: LanguageKeys.Commands.General.PingExtended,
	guarded: true
})
export default class extends SkyraCommand {
	public async run(message: Message) {
		const t = await message.fetchT();
		const msg = await message.send(t(LanguageKeys.Commands.General.Ping));
		return message.send(
			t(LanguageKeys.Commands.General.PingPong, {
				diff: (msg.editedTimestamp || msg.createdTimestamp) - (message.editedTimestamp || message.createdTimestamp),
				ping: Math.round(this.context.client.ws.ping)
			})
		);
	}
}
