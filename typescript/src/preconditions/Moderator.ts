import { LanguageKeys } from '#lib/i18n/languageKeys';
import { PermissionsPrecondition } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import { isModerator } from '#utils/functions';

export class UserPermissionsPrecondition extends PermissionsPrecondition {
	public async handle(message: GuildMessage): PermissionsPrecondition.AsyncResult {
		return (await isModerator(message.member)) ? this.ok() : this.error({ identifier: LanguageKeys.Preconditions.Moderator });
	}
}
