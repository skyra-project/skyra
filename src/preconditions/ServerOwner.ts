import { LanguageKeys } from '#lib/i18n/languageKeys';
import { PermissionsPrecondition } from '#lib/structures';
import type { GuildMessage } from '#lib/types';

export class UserPermissionsPrecondition extends PermissionsPrecondition {
	public handle(message: GuildMessage): PermissionsPrecondition.Result {
		return message.author.id === message.guild.ownerID ? this.ok() : this.error({ identifier: LanguageKeys.Preconditions.ServerOwner });
	}
}
