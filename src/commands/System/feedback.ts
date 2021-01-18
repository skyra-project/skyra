import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures/commands/SkyraCommand';
import { ApplyOptions } from '@skyra/decorators';
import type { Message } from 'discord.js';

@ApplyOptions<SkyraCommand.Options>({
	bucket: 2,
	cooldown: 20,
	description: LanguageKeys.Commands.System.FeedbackDescription,
	extendedHelp: LanguageKeys.Commands.System.FeedbackExtended,
	guarded: true,
	usage: '<message:string{8,1900}>'
})
export default class extends SkyraCommand {
	public async run(message: Message, [feedback]: [string]) {
		// Set the global flag
		Reflect.set(message.flagArgs, 'global', 'global');

		// Send the feedback as a suggestion
		return this.client.commands.get('suggest')!.run(message, [feedback]);
	}

	public async init() {
		if (this.client.webhookFeedback === null) this.disable();
	}
}
