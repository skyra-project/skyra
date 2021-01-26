import { Argument, ArgumentContext } from '@sapphire/framework';

export class UserArgument extends Argument<true> {
	public run(parameter: string, context: ArgumentContext) {
		const lowerCasedParameter = parameter.toLowerCase();
		if (lowerCasedParameter === 'off') return this.ok(true);
		if (lowerCasedParameter === 'reset') return this.ok(true);
		return this.error({ parameter, context });
	}
}
