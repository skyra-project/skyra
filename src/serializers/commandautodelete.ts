import { Serializer, type CommandAutoDelete } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { seconds } from '#utils/common';
import type { Awaitable } from '@sapphire/utilities';

export class UserSerializer extends Serializer<CommandAutoDelete> {
	public async parse(args: Serializer.Args) {
		const command = await args.pickResult('command');
		if (command.isErr()) return this.errorFromArgument(args, command.unwrapErr());

		const duration = await args.pickResult('timespan', { minimum: seconds(1) });
		if (duration.isErr()) return this.errorFromArgument(args, duration.unwrapErr());

		return this.ok([command.unwrap().name, duration.unwrap()] as const);
	}

	public isValid(value: CommandAutoDelete): Awaitable<boolean> {
		return (
			Array.isArray(value) &&
			value.length === 2 &&
			typeof value[0] === 'string' &&
			typeof value[1] === 'number' &&
			this.container.stores.get('commands').has(value[0])
		);
	}

	public override stringify(value: CommandAutoDelete, { t }: Serializer.UpdateContext): string {
		return `[${value[0]} -> ${t(LanguageKeys.Globals.DurationValue, { value: value[1] })}]`;
	}

	public override equals(left: CommandAutoDelete, right: CommandAutoDelete): boolean {
		return left[0] === right[0];
	}
}
