import { translate } from '#lib/i18n/translate';
import { sendTemporaryMessage } from '#utils/functions';
import { CommandDeniedPayload, Events, Listener, UserError } from '@sapphire/framework';
import { resolveKey } from '@sapphire/plugin-i18next';
import type { Message } from 'discord.js';

export class UserListener extends Listener<typeof Events.CommandDenied> {
	public async run(error: UserError, { message, command }: CommandDeniedPayload) {
		// `context: { silent: true }` should make UserError silent:
		// Use cases for this are for example permissions error when running the `eval` command.
		if (Reflect.get(Object(error.context), 'silent')) return;

		const identifier = translate(error.identifier);
		return this.alert(message, await resolveKey(message, identifier, { message, command, ...(error.context as any) }));
	}

	private alert(message: Message, content: string) {
		return sendTemporaryMessage(message, { content, allowedMentions: { users: [message.author.id], roles: [] } });
	}
}
