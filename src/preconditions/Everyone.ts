import { PermissionsPrecondition } from '#lib/structures';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<PermissionsPrecondition.Options>({ guildOnly: false })
export class UserPermissionsPrecondition extends PermissionsPrecondition {
	public handle(): PermissionsPrecondition.Result {
		return this.ok();
	}
}
