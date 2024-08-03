import type { Events, TaskErrorPayload } from '#lib/types';
import { ApplyOptions } from '@sapphire/decorators';
import { Listener } from '@sapphire/framework';
import { captureException } from '@sentry/node';
import { envIsDefined } from '@skyra/env-utilities';

@ApplyOptions({ enabled: envIsDefined('SENTRY_URL') })
export class UserListener extends Listener<Events.TaskError> {
	public run(error: Error, context: TaskErrorPayload) {
		captureException(error, { tags: { name: context.piece.name, entity: context.entry.id } });
	}
}
