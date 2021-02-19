import { LanguageKeys } from '#lib/i18n/languageKeys';
import type { SkyraArgs } from '#lib/structures';
import { UserError } from '@sapphire/framework';
import type { InvalidTypeError } from './InvalidTypeError';

export class MissingArgumentsError extends UserError {
	public readonly args: SkyraArgs;
	public readonly type: InvalidTypeError.Type;

	public constructor(args: SkyraArgs, type: InvalidTypeError.Type) {
		super({ identifier: LanguageKeys.Serializers.CustomCommands.MissingParameter, context: { args, type } });

		this.args = args;
		this.type = type;
	}
}
