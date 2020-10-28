import { GuildEntity } from '@lib/database/entities/GuildEntity';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { Awaited } from '@sapphire/utilities';
import { AliasPiece, constants, Language, MentionRegex } from 'klasa';
import { ConfigurableKeyValue } from '../ConfigurableKeyValue';

export abstract class Serializer<T> extends AliasPiece {
	/**
	 * Resolves a string into a value.
	 * @param value The value to parsed.
	 * @param context The context for the key.
	 */
	public abstract parse(value: string, context: SerializerUpdateContext): Awaited<T>;

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
	public stringify(data: T, context: SerializerUpdateContext): string {
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
	 * Standard regular expressions for matching mentions and snowflake ids
	 */
	public static regex: MentionRegex = constants.MENTION_REGEX;

	/**
	 * Check the boundaries of a key's minimum or maximum.
	 * @param value The value to check
	 * @param entry The schema entry that manages the key
	 * @param language The language that is used for this context
	 */
	protected static minOrMax(value: number, { entry: { minimum, maximum, inclusive, name }, language }: SerializerUpdateContext): boolean {
		if (minimum !== null && maximum !== null) {
			if ((value >= minimum && value <= maximum && inclusive) || (value > minimum && value < maximum && !inclusive)) {
				return true;
			}

			if (minimum === maximum) {
				throw new RangeError(
					language.get(inclusive ? LanguageKeys.Resolvers.MinmaxExactlyInclusive : LanguageKeys.Resolvers.MinmaxExactlyExclusive, {
						name,
						min: minimum
					})
				);
			}

			throw new RangeError(
				language.get(inclusive ? LanguageKeys.Resolvers.MinmaxBothInclusive : LanguageKeys.Resolvers.MinmaxBothExclusive, {
					name,
					min: minimum,
					max: maximum
				})
			);
		}

		if (minimum !== null) {
			if ((value >= minimum && inclusive) || (value > minimum && !inclusive)) {
				return true;
			}

			throw new RangeError(
				language.get(inclusive ? LanguageKeys.Resolvers.MinmaxMinInclusive : LanguageKeys.Resolvers.MinmaxMinExclusive, {
					name,
					min: minimum
				})
			);
		}

		if (maximum !== null) {
			if ((value <= maximum && inclusive) || (value < maximum && !inclusive)) {
				return true;
			}

			throw new RangeError(
				language.get(inclusive ? LanguageKeys.Resolvers.MinmaxMaxInclusive : LanguageKeys.Resolvers.MinmaxMaxExclusive, {
					name,
					max: maximum
				})
			);
		}

		return true;
	}
}

export interface SerializerUpdateContext {
	entry: ConfigurableKeyValue;
	entity: GuildEntity;
	language: Language;
	extraContext: unknown;
}
