import { LanguageKeys } from '#lib/i18n/languageKeys';
import { getModeration } from '#utils/functions';
import { Argument, Identifiers } from '@sapphire/framework';

const minimum = 0;
const maximum = 2_147_483_647; // Maximum value for int32

export class UserArgument extends Argument<number> {
	public async run(parameter: string, context: Argument.Context) {
		const latest = context.args.t(LanguageKeys.Arguments.CaseLatestOptions);
		if (latest.includes(parameter)) return this.ok(await getModeration(context.message.guild!).getCurrentId());

		const parsed = Number(parameter);
		if (!Number.isInteger(parsed)) {
			return this.error({ parameter, identifier: Identifiers.ArgumentIntegerError, context: { ...context, minimum, maximum } });
		}

		if (parsed < minimum) {
			return this.error({ parameter, identifier: Identifiers.ArgumentIntegerTooSmall, context: { ...context, minimum, maximum } });
		}

		if (parsed > maximum) {
			return this.error({ parameter, identifier: Identifiers.ArgumentIntegerTooLarge, context: { ...context, minimum, maximum } });
		}

		return this.ok(parsed);
	}
}
