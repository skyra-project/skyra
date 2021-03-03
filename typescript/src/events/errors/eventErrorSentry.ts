import { envIsDefined } from '#lib/env';
import { ApplyOptions } from '@sapphire/decorators';
import { Event, EventErrorPayload, Events } from '@sapphire/framework';
import { captureException } from '@sentry/node';

@ApplyOptions({ enabled: envIsDefined('SENTRY_URL') })
export class UserEvent extends Event<Events.EventError> {
	public run(error: Error, context: EventErrorPayload) {
		captureException(error, { tags: { name: context.piece.name } });
	}
}
