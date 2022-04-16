import type { TaskErrorPayload } from '#lib/types';
import type { Events } from '#lib/types/Enums';
import { ApplyOptions } from '@sapphire/decorators';
import { Listener } from '@sapphire/framework';
import { captureException } from '@sentry/minimal';
import { envIsDefined } from '@skyra/env-utilities';

@ApplyOptions({ enabled: envIsDefined('SENTRY_URL') })
export class UserListener extends Listener<Events.TaskError> {
	public run(error: Error, context: TaskErrorPayload) {
		captureException(error, { tags: { name: context.piece.name, entity: context.entity.id } });
	}
}
