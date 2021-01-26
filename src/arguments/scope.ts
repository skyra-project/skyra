import { Scope } from '#lib/types';
import { Argument, ArgumentContext } from '@sapphire/framework';

export class UserArgument extends Argument<Scope> {
	public run(parameter: string, context: ArgumentContext) {
		const lowerCasedParameter = parameter.toLowerCase();
		if (lowerCasedParameter === 'local') return this.ok(Scope.Local);
		if (lowerCasedParameter === 'global') return this.ok(Scope.Global);
		return this.error({ parameter, context });
	}
}
