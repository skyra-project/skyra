import { resolveCaseId } from '#utils/resolvers';
import { Argument } from '@sapphire/framework';

export class UserArgument extends Argument<number> {
	public async run(parameter: string, context: Argument.Context) {
		return (await resolveCaseId(parameter, context.args.t, context.message.guild!)) //
			.mapErrInto((identifier) => this.error({ parameter, identifier, context }));
	}
}
