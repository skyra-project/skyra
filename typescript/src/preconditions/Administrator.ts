import { LanguageKeys } from '#lib/i18n/languageKeys';
import { PermissionsPrecondition } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import { isAdmin } from '#utils/functions';

export class UserPermissionsPrecondition extends PermissionsPrecondition {
	public async handle(message: GuildMessage): PermissionsPrecondition.AsyncResult {
		return (await isAdmin(message.member)) ? this.ok() : this.error({ identifier: LanguageKeys.Preconditions.Administrator });
	}
}
