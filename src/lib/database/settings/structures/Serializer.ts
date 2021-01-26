import type { GuildEntity } from '#lib/database/entities/GuildEntity';
import type { SchemaKey } from '#lib/database/settings/schema/SchemaKey';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { translate } from '#lib/i18n/translate';
import type { SkyraArgs } from '#lib/structures';
import { O } from '#utils/constants';
import { AliasPiece, AliasPieceOptions, ArgumentError, UserError } from '@sapphire/framework';
import type { Awaited } from '@sapphire/utilities';
import type { Guild } from 'discord.js';
import type { TFunction } from 'i18next';

export interface Ok<T> {
	success: true;
	value: T;
}

export interface Err<E> {
	success: false;
	error: E;
}

export type Result<T, E> = Ok<T> | Err<E>;

export type SerializerResult<T> = Result<T, Error>;
export type AsyncSerializerResult<T> = Promise<Result<T, Error>>;

export abstract class Serializer<T> extends AliasPiece {
	/**
	 * Resolves a string into a value.
	 * @param value The value to parsed.
	 * @param context The context for the key.
	 */
	public abstract parse(args: Serializer.Args, context: SerializerUpdateContext): SerializerResult<T> | AsyncSerializerResult<T>;

	/**
	 * Check whether or not the value is valid.
	 * @param value The value to check.
	 */
	public abstract isValid(value: T, context: SerializerUpdateContext): Awaited<boolean>;

	/**
	 * The stringify method to be overwritten in actual Serializers
	 * @param data The data to stringify
	 * @param guild The guild given for context in this call
	 */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public stringify(data: T, _context: SerializerUpdateContext): string {
		return String(data);
	}

	/**
	 * Check if two entries are equals.
	 * @param left The left value to check against.
	 * @param right The right value to check against.
	 */
	public equals(left: T, right: T): boolean {
		return left === right;
	}

	/**
	 * Returns a successful result.
	 * @param value The value to return.
	 */
	protected ok<T>(value: T): SerializerResult<T> {
		return { success: true, value };
	}

	/**
	 * Returns an erroneous result.
	 * @param error The message of the error.
	 */
	protected error(error: string): SerializerResult<T> {
		return { success: false, error: new Error(error) };
	}

	protected errorFromArgument(args: Serializer.Args, error: UserError): SerializerResult<T>;
	/**
	 * Returns an erroneous result given an ArgumentError.
	 * @param args The Args parser.
	 * @param error The error returned by the Argument.
	 */
	protected errorFromArgument<E>(args: Serializer.Args, error: ArgumentError<E>): SerializerResult<T>;
	protected errorFromArgument<E>(args: Serializer.Args, error: ArgumentError<E>): SerializerResult<T> {
		const argument = error.argument.name;
		const identifier = translate(error.identifier);
		return this.error(args.t(identifier, { ...error, ...(error.context as O), argument }));
	}

	/**
	 * Check the boundaries of a key's minimum or maximum.
	 * @param length The value to check
	 * @param entry The schema entry that manages the key
	 * @param language The language that is used for this context
	 */
	protected minOrMax(value: T, length: number, { entry: { minimum, maximum, inclusive, name }, t }: SerializerUpdateContext): SerializerResult<T> {
		if (minimum !== null && maximum !== null) {
			if ((length >= minimum && length <= maximum && inclusive) || (length > minimum && length < maximum && !inclusive)) {
				return this.ok(value);
			}

			if (minimum === maximum) {
				return this.error(
					t(inclusive ? LanguageKeys.Serializers.MinMaxExactlyInclusive : LanguageKeys.Serializers.MinMaxExactlyExclusive, {
						name,
						min: minimum
					})
				);
			}

			return this.error(
				t(inclusive ? LanguageKeys.Serializers.MinMaxBothInclusive : LanguageKeys.Serializers.MinMaxBothExclusive, {
					name,
					min: minimum,
					max: maximum
				})
			);
		}

		if (minimum !== null) {
			if ((length >= minimum && inclusive) || (length > minimum && !inclusive)) {
				return this.ok(value);
			}

			return this.error(
				t(inclusive ? LanguageKeys.Serializers.MinMaxMinInclusive : LanguageKeys.Serializers.MinMaxMinExclusive, {
					name,
					min: minimum
				})
			);
		}

		if (maximum !== null) {
			if ((length <= maximum && inclusive) || (length < maximum && !inclusive)) {
				return this.ok(value);
			}

			return this.error(
				t(inclusive ? LanguageKeys.Serializers.MinMaxMaxInclusive : LanguageKeys.Serializers.MinMaxMaxExclusive, {
					name,
					max: maximum
				})
			);
		}

		return this.ok(value);
	}
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Serializer {
	export type Options = AliasPieceOptions;
	export type Args = SkyraArgs;
}

export interface SerializerUpdateContext {
	entry: SchemaKey;
	entity: GuildEntity;
	guild: Guild;
	t: TFunction;
}
