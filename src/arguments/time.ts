import { LanguageKeys } from '#lib/i18n/languageKeys';
import { Argument, ArgumentContext } from '@sapphire/framework';

export class UserArgument extends Argument<Date> {
	private get date() {
		return this.context.stores.get('arguments').get('date') as Argument<Date>;
	}

	private get duration() {
		return this.context.stores.get('arguments').get('duration') as Argument<Date>;
	}

	public async run(parameter: string, context: ArgumentContext<Date>) {
		const date = await Promise.resolve()
			.then(() => this.date.run(parameter, context))
			.then((date) => (date.success ? date : this.duration.run(parameter, context)));

		if (date.success && date.value.getTime() > Date.now()) return this.ok(date.value);
		return this.error({ parameter, identifier: LanguageKeys.Arguments.Time, context });
	}
}
