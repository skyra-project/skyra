import { translate } from '#lib/i18n/translate';
import { Events } from '#lib/types/Enums';
import { CommandDeniedPayload, Event, UserError } from '@sapphire/framework';
import { Message } from 'discord.js';

export class UserEvent extends Event<Events.CommandDenied> {
	public async run(error: UserError, { message }: CommandDeniedPayload) {
		const identifier = translate(error.identifier);
		return this.alert(message, await message.resolveKey(identifier, error.context));
	}

	private async alert(message: Message, content: string) {
		return message.alert(content, { allowedMentions: { users: [message.author.id], roles: [] } });
	}
}
