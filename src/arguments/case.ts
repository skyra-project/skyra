import { Argument, ArgumentContext, Identifiers } from '@sapphire/framework';

const kMinimum = 0;
const kMaximum = 2_147_483_647; // Maximum value for int32

export class UserArgument extends Argument<number> {
	public async run(parameter: string, context: ArgumentContext) {
		if (parameter === 'latest') return this.ok(await context.message.guild!.moderation.count());

		const parsed = Number(parameter);
		if (!Number.isInteger(parsed)) {
			return this.error({ parameter, identifier: Identifiers.ArgumentInteger, context });
		}

		if (parsed < kMinimum) {
			return this.error({ parameter, identifier: Identifiers.ArgumentIntegerTooSmall, context });
		}

		if (parsed > kMaximum) {
			return this.error({ parameter, identifier: Identifiers.ArgumentIntegerTooBig, context });
		}

		return this.ok(parsed);
	}
}
