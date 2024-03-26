import { resolveTimeSpan } from '#utils/resolvers';
import { Argument } from '@sapphire/framework';

export class UserArgument extends Argument<number> {
	public run(parameter: string, context: Argument.Context) {
		return resolveTimeSpan(parameter, { minimum: context.minimum, maximum: context.maximum }) //
			.mapErrInto((identifier) => this.error({ parameter, identifier, context }));
	}
}
