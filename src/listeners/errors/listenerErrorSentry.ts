import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener, UserError, type ListenerErrorPayload } from '@sapphire/framework';
import { captureException } from '@sentry/node';
import { envIsDefined } from '@skyra/env-utilities';

@ApplyOptions({ enabled: envIsDefined('SENTRY_URL') })
export class UserListener extends Listener<typeof Events.ListenerError> {
	public run(error: Error, context: ListenerErrorPayload) {
		// We generally do not care about `UserError`s in listeners since they're not bugs.
		if (error instanceof UserError) return;

		captureException(error, { tags: { name: context.piece.name } });
	}
}
