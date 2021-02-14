import { LanguageKeys } from '#lib/i18n/languageKeys';
import { fetchAvatar } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { ExtendedArgument, ExtendedArgumentContext, ExtendedArgumentOptions } from '@sapphire/framework';
import type { Image } from 'canvas';
import type { User } from 'discord.js';

@ApplyOptions<ExtendedArgumentOptions<'userName'>>({ baseArgument: 'userName' })
export class UserExtendedArgument extends ExtendedArgument<'userName', Image> {
	public async handle(user: User, context: ExtendedArgumentContext) {
		try {
			return this.ok(await fetchAvatar(user));
		} catch {
			return this.error({ parameter: context.parameter, identifier: LanguageKeys.Arguments.ImageNotFound, context });
		}
	}
}
