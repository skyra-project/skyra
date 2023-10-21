import { LanguageKeys } from '#lib/i18n/languageKeys';
import { Argument } from '@sapphire/framework';

export class UserArgument extends Argument<Date> {
	private get date() {
		return this.container.stores.get('arguments').get('date') as Argument<Date>;
	}

	private get duration() {
		return this.container.stores.get('arguments').get('duration') as Argument<Date>;
	}

	public async run(parameter: string, context: Argument.Context<Date>) {
		let result = await this.date.run(parameter, context);
		if (result.isErr()) result = await this.duration.run(parameter, context);

		if (result.isOkAnd((date) => date.getTime() > Date.now())) return this.ok(result.unwrap());
		return this.error({ parameter, identifier: LanguageKeys.Arguments.Time, context });
	}
}
