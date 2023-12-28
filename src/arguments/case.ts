import { LanguageKeys } from '#lib/i18n/languageKeys';
import { getModeration } from '#utils/functions';
import { Argument, Resolvers } from '@sapphire/framework';

const minimum = 0;
const maximum = 2_147_483_647; // Maximum value for int32

export class UserArgument extends Argument<number> {
	public async run(parameter: string, context: Argument.Context) {
		const latest = context.args.t(LanguageKeys.Arguments.CaseLatestOptions);
		if (latest.includes(parameter)) return this.ok(await getModeration(context.message.guild!).getCurrentId());

		return Resolvers.resolveInteger(parameter, { minimum, maximum }) //
			.mapErrInto((identifier) => this.error({ parameter, identifier, context }));
	}
}
