import { GuildEntity } from '@lib/database/entities/GuildEntity';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { AliasPiece, constants, Language, MentionRegex } from 'klasa';
import { ConfigurableKeyValue } from '../ConfigurableKeyValue';

export abstract class Serializer extends AliasPiece {
	/**
	 * Resolve a value given directly from the {@link Settings#update} call.
	 * @param data The data to resolve
	 * @param context The context in which this serializer is called
	 */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public validate(data: unknown, context: SerializerUpdateContext): unknown {
		return data;
	}

	/**
	 * Resolve a value given directly from the {@link Settings#resolve} call.
	 * @param data The data to resolve
	 * @param context The context in which this serializer is called
	 */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public resolve(data: unknown, context: SerializerUpdateContext): unknown {
		return data;
	}

	/**
	 * The deserialize method to be overwritten in actual Serializers.
	 * @param data The data to deserialize
	 * @param context The context in which this serializer is called
	 */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public deserialize(data: unknown, context: SerializerUpdateContext): unknown {
		return data;
	}

	/**
	 * The serialize method to be overwritten in actual Serializers.
	 * @param data The data to serialize
	 */
	public serialize(data: unknown): unknown {
		return data;
	}

	/**
	 * The stringify method to be overwritten in actual Serializers
	 * @param data The data to stringify
	 * @param guild The guild given for context in this call
	 */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public stringify(data: unknown, entry: GuildEntity): string {
		return String(data);
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
	protected static minOrMax(value: number, { minimum, maximum, inclusive, name }: ConfigurableKeyValue, language: Language): boolean {
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
