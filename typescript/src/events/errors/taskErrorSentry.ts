import { envIsDefined } from '#lib/env';
import type { TaskErrorPayload } from '#lib/types';
import type { Events } from '#lib/types/Enums';
import { ApplyOptions } from '@sapphire/decorators';
import { Event } from '@sapphire/framework';
import { captureException } from '@sentry/minimal';

@ApplyOptions({ enabled: envIsDefined('SENTRY_URL') })
export class UserEvent extends Event<Events.TaskError> {
	public run(error: Error, context: TaskErrorPayload) {
		captureException(error, { tags: { name: context.piece.name, entity: context.entity.id } });
	}
}
