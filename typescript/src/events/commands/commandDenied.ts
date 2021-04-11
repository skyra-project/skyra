import { translate } from '#lib/i18n/translate';
import { Events } from '#lib/types/Enums';
import { CommandDeniedPayload, Event, UserError } from '@sapphire/framework';
import { Message } from 'discord.js';

export class UserEvent extends Event<Events.CommandDenied> {
	public async run(error: UserError, { message, command }: CommandDeniedPayload) {
		// `context: { silent: true }` should make UserError silent:
		// Use cases for this are for example permissions error when running the `eval` command.
		if (Reflect.get(Object(error.context), 'silent')) return;

		const identifier = translate(error.identifier);
		return this.alert(message, await message.resolveKey(identifier, { message, command, ...(error.context as any) }));
	}

	private async alert(message: Message, content: string) {
		return message.alert(content, { allowedMentions: { users: [message.author.id], roles: [] } });
	}
}
