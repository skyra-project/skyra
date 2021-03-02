import { PermissionsPrecondition } from '#lib/structures';

export class UserPermissionsPrecondition extends PermissionsPrecondition {
	public handle(): PermissionsPrecondition.Result {
		return this.ok();
	}
}
