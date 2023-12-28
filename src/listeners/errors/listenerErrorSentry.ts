import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener, type ListenerErrorPayload } from '@sapphire/framework';
import { captureException } from '@sentry/node';
import { envIsDefined } from '@skyra/env-utilities';

@ApplyOptions({ enabled: envIsDefined('SENTRY_URL') })
export class UserListener extends Listener<typeof Events.ListenerError> {
	public run(error: Error, context: ListenerErrorPayload) {
		captureException(error, { tags: { name: context.piece.name } });
	}
}
