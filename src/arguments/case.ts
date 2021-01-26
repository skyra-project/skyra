import { LanguageKeys } from '#lib/i18n/languageKeys';
import { Argument, ArgumentContext, Identifiers } from '@sapphire/framework';

const minimum = 0;
const maximum = 2_147_483_647; // Maximum value for int32

export class UserArgument extends Argument<number> {
	public async run(parameter: string, context: ArgumentContext) {
		const latest = context.args.t(LanguageKeys.Arguments.CaseLatestOptions);
		if (latest.includes(parameter)) return this.ok(await context.message.guild!.moderation.count());

		const parsed = Number(parameter);
		if (!Number.isInteger(parsed)) {
			return this.error({ parameter, identifier: Identifiers.ArgumentInteger, context: { ...context, minimum, maximum } });
		}

		if (parsed < minimum) {
			return this.error({ parameter, identifier: Identifiers.ArgumentIntegerTooSmall, context: { ...context, minimum, maximum } });
		}

		if (parsed > maximum) {
			return this.error({ parameter, identifier: Identifiers.ArgumentIntegerTooBig, context: { ...context, minimum, maximum } });
		}

		return this.ok(parsed);
	}
}
