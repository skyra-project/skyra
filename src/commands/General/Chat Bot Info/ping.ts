import { SkyraCommand, SkyraCommandOptions } from '#lib/structures/commands/SkyraCommand';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { ApplyOptions } from '@skyra/decorators';
import { Message } from 'discord.js';

@ApplyOptions<SkyraCommandOptions>({
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
				ping: Math.round(this.client.ws.ping)
			})
		);
	}
}
