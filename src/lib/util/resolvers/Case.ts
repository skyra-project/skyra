import type { ModerationEntity } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { translate } from '#lib/i18n/translate';
import { getModeration } from '#utils/functions';
import { Resolvers, Result, UserError, err, ok } from '@sapphire/framework';
import type { TFunction } from '@sapphire/plugin-i18next';
import type { Guild } from 'discord.js';

export async function resolveCaseId(parameter: string, t: TFunction, guild: Guild): Promise<Result<number, UserError>> {
	const maximum = await getModeration(guild).getCurrentId();
	if (maximum === 0) return err(new UserError({ identifier: LanguageKeys.Arguments.CaseNoEntries }));

	if (t(LanguageKeys.Arguments.CaseLatestOptions).includes(parameter)) return ok(maximum);
	return Resolvers.resolveInteger(parameter, { minimum: 1, maximum }) //
		.mapErr((error) => new UserError({ identifier: translate(error), context: { parameter, minimum: 1, maximum } }));
}

export async function resolveCase(parameter: string, t: TFunction, guild: Guild): Promise<Result<ModerationEntity, UserError>> {
	const result = await resolveCaseId(parameter, t, guild);
	return result.match({
		ok: async (value) => {
			const entry = await getModeration(guild).fetch(value);
			return entry ? ok(entry) : err(new UserError({ identifier: LanguageKeys.Arguments.CaseUnknownEntry }));
		},
		err: (error) => err(error)
	});
}
