import { PermissionLevels } from '@lib/types/Enums';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { Adder } from '@utils/Adder';
import { GuildSecurity } from '@utils/Security/GuildSecurity';
import { Command, CommandOptions, CommandStore, Duration, KlasaMessage, SchemaEntry } from 'klasa';
import { SelfModeratorBitField, SelfModeratorHardActionFlags } from './SelfModeratorBitField';

export enum AKeys {
	Enable,
	Disable,
	SoftAction,
	HardAction,
	HardActionDuration,
	ThresholdMaximum,
	ThresholdDuration,
	Show
}

export const kActions = new Map<string, AKeys>([
	['e', AKeys.Enable],
	['enable', AKeys.Enable],
	['on', AKeys.Enable],
	['d', AKeys.Disable],
	['disable', AKeys.Disable],
	['off', AKeys.Disable],
	['a', AKeys.SoftAction],
	['action', AKeys.SoftAction],
	['soft-action', AKeys.SoftAction],
	['p', AKeys.HardAction],
	['punish', AKeys.HardAction],
	['punishment', AKeys.HardAction],
	['pd', AKeys.HardActionDuration],
	['punish-duration', AKeys.HardActionDuration],
	['punishment-duration', AKeys.HardActionDuration],
	['t', AKeys.ThresholdMaximum],
	['tm', AKeys.ThresholdMaximum],
	['threshold-maximum', AKeys.ThresholdMaximum],
	['td', AKeys.ThresholdDuration],
	['threshold-duration', AKeys.ThresholdDuration],
	['s', AKeys.Show],
	['sh', AKeys.Show],
	['show', AKeys.Show],
	['display', AKeys.Show]
]);

export enum ASKeys {
	Alert = SelfModeratorBitField.FLAGS.ALERT,
	Log = SelfModeratorBitField.FLAGS.LOG,
	Delete = SelfModeratorBitField.FLAGS.DELETE
}

export const kSoftActions = new Map<string, ASKeys>([
	['a', ASKeys.Alert],
	['al', ASKeys.Alert],
	['alert', ASKeys.Alert],
	['l', ASKeys.Log],
	['log', ASKeys.Log],
	['d', ASKeys.Delete],
	['del', ASKeys.Delete],
	['delete', ASKeys.Delete]
]);

export const kHardActions = new Map<string, SelfModeratorHardActionFlags>([
	['r', SelfModeratorHardActionFlags.None],
	['reset', SelfModeratorHardActionFlags.None],
	['n', SelfModeratorHardActionFlags.None],
	['none', SelfModeratorHardActionFlags.None],
	['w', SelfModeratorHardActionFlags.Warning],
	['warn', SelfModeratorHardActionFlags.Warning],
	['warning', SelfModeratorHardActionFlags.Warning],
	['m', SelfModeratorHardActionFlags.Mute],
	['mute', SelfModeratorHardActionFlags.Mute],
	['k', SelfModeratorHardActionFlags.Kick],
	['kick', SelfModeratorHardActionFlags.Kick],
	['sb', SelfModeratorHardActionFlags.SoftBan],
	['softban', SelfModeratorHardActionFlags.SoftBan],
	['soft-ban', SelfModeratorHardActionFlags.SoftBan],
	['b', SelfModeratorHardActionFlags.Ban],
	['ban', SelfModeratorHardActionFlags.Ban]
]);

export abstract class SelfModerationCommand extends Command {
	protected constructor(store: CommandStore, file: string[], directory: string, options: CommandOptions = {}) {
		super(store, file, directory, {
			cooldown: 5,
			permissionLevel: PermissionLevels.Administrator,
			runIn: ['text'],
			usage: '(action:action) (value:value)',
			usageDelim: ' ',
			...options
		});

		this.createCustomResolver('action', (arg, _possible, message) => {
			if (typeof arg === 'undefined') return AKeys.Show;
			const action = kActions.get(arg.toLowerCase());
			if (typeof action === 'undefined')
				throw message.language.get(LanguageKeys.Commands.Moderation.AutomaticParameterInvalidMissingAction, { name: this.name });
			return action;
		}).createCustomResolver('value', (arg, _possible, message, [type]: AKeys[]) => {
			if (type === AKeys.Enable) return true;
			if (type === AKeys.Disable) return false;
			if (type === AKeys.Show) return null;
			if (!arg) throw message.language.get(LanguageKeys.Commands.Moderation.AutomaticParameterInvalidMissingArguments, { name: this.name });

			if (type === AKeys.SoftAction) {
				const softAction = kSoftActions.get(arg.toLowerCase());
				if (typeof softAction === 'undefined')
					throw message.language.get(LanguageKeys.Commands.Moderation.AutomaticParameterInvalidSoftaction, { name: this.name });
				const previousSoftAction = message.guild!.settings.get(this.keySoftAction) as number;
				return SelfModerationCommand.toggle(previousSoftAction, softAction);
			}

			if (type === AKeys.HardAction) {
				const hardAction = kHardActions.get(arg.toLowerCase());
				if (typeof hardAction === 'undefined')
					throw message.language.get(LanguageKeys.Commands.Moderation.AutomaticParameterInvalidHardaction, { name: this.name });
				return hardAction;
			}

			if (type === AKeys.HardActionDuration) {
				if (/^(?:reset|0\w?)$/i.test(arg)) return null;
				const key = message.guild!.settings.schema.get(this.keyHardActionDuration) as SchemaEntry;
				return SelfModerationCommand.parseDuration(message, key, arg, 'Hard Action Duration');
			}

			if (type === AKeys.ThresholdMaximum) {
				const key = message.guild!.settings.schema.get(this.keyThresholdMaximum) as SchemaEntry;
				return SelfModerationCommand.parseMaximum(message, key, arg, 'Threshold Maximum');
			}

			if (type === AKeys.ThresholdDuration) {
				const key = message.guild!.settings.schema.get(this.keyThresholdDuration) as SchemaEntry;
				return SelfModerationCommand.parseDuration(message, key, arg, 'Threshold Duration');
			}

			throw new Error('Unreachable.');
		});
	}

	public async run(message: KlasaMessage, [action, value]: [AKeys, unknown]) {
		if (action === AKeys.Show) return this.show(message);

		const key = this.getProperty(action)!;
		await message.guild!.settings.update(key, value, {
			extraContext: { author: message.author.id }
		});

		switch (action) {
			case AKeys.Disable: {
				message.guild!.security.adders[this.$adder] = null;
				break;
			}
			case AKeys.SoftAction: {
				value = SelfModerationCommand.displaySoftAction(message, value as number).join('`, `');
				break;
			}
			case AKeys.HardAction: {
				value = message.language.get(SelfModerationCommand.displayHardAction(value as SelfModeratorHardActionFlags));
				break;
			}
			case AKeys.Enable:
			case AKeys.ThresholdMaximum:
			case AKeys.ThresholdDuration: {
				this.manageAdder(message);
			}
			case AKeys.HardActionDuration:
				break;
		}

		return message.send(SelfModerationCommand.getLanguageKey(message, action, value));
	}

	protected show(message: KlasaMessage) {
		const { settings } = message.guild!;
		const [enabled, softAction, hardAction, hardActionDuration, thresholdMaximum, thresholdDuration] = settings.pluck(
			this.keyEnabled,
			this.keySoftAction,
			this.keyHardAction,
			this.keyHardActionDuration,
			this.keyThresholdMaximum,
			this.keyThresholdDuration
		) as [boolean, number, number, number, number, number];

		const i18n = message.language.get.bind(message.language);
		const duration = message.language.duration.bind(message.language);
		const [yes, no] = [
			i18n(LanguageKeys.Commands.Moderation.AutomaticParameterEnabled),
			i18n(LanguageKeys.Commands.Moderation.AutomaticParameterDisabled)
		];
		return message.sendCode(
			'prolog',
			i18n(LanguageKeys.Commands.Moderation.AutomaticParameterShow, {
				kEnabled: enabled ? yes : no,
				kAlert: SelfModerationCommand.has(softAction, ASKeys.Alert) ? yes : no,
				kLog: SelfModerationCommand.has(softAction, ASKeys.Log) ? yes : no,
				kDelete: SelfModerationCommand.has(softAction, ASKeys.Delete) ? yes : no,
				kHardAction: i18n(SelfModerationCommand.displayHardAction(hardAction)),
				hardActionDurationText:
					hardActionDuration === null
						? i18n(LanguageKeys.Commands.Moderation.AutomaticParameterShowDurationPermanent)
						: duration(hardActionDuration),
				thresholdMaximumText: thresholdMaximum ? thresholdMaximum : i18n(LanguageKeys.Commands.Moderation.AutomaticParameterShowUnset),
				thresholdDurationText: thresholdDuration
					? duration(thresholdDuration)
					: i18n(LanguageKeys.Commands.Moderation.AutomaticParameterShowUnset)
			})
		);
	}

	private getProperty(action: AKeys) {
		switch (action) {
			case AKeys.Enable:
			case AKeys.Disable:
				return this.keyEnabled;
			case AKeys.SoftAction:
				return this.keySoftAction;
			case AKeys.HardAction:
				return this.keyHardAction;
			case AKeys.HardActionDuration:
				return this.keyHardActionDuration;
			case AKeys.ThresholdMaximum:
				return this.keyThresholdMaximum;
			case AKeys.ThresholdDuration:
				return this.keyThresholdDuration;
			default:
				throw new Error('Unexpected.');
		}
	}

	private manageAdder(message: KlasaMessage) {
		const [maximum, duration] = message.guild!.settings.pluck(this.keyThresholdMaximum, this.keyThresholdDuration) as (number | null)[];
		const adder = message.guild!.security.adders[this.$adder];
		if (!maximum || !duration) {
			if (adder !== null) message.guild!.security.adders[this.$adder] = null;
		} else if (adder === null) {
			message.guild!.security.adders[this.$adder] = new Adder(maximum, duration);
		} else {
			adder.maximum = maximum;
			adder.duration = duration;
		}
	}

	private static displaySoftAction(message: KlasaMessage, softAction: number) {
		const actions: string[] = [];
		if (SelfModerationCommand.has(softAction, ASKeys.Alert))
			actions.push(message.language.get(LanguageKeys.Commands.Moderation.AutomaticValueSoftActionAlert));
		if (SelfModerationCommand.has(softAction, ASKeys.Log))
			actions.push(message.language.get(LanguageKeys.Commands.Moderation.AutomaticValueSoftActionLog));
		if (SelfModerationCommand.has(softAction, ASKeys.Delete))
			actions.push(message.language.get(LanguageKeys.Commands.Moderation.AutomaticValueSoftActionDelete));
		return actions;
	}

	private static getLanguageKey(message: KlasaMessage, action: AKeys, value: unknown) {
		switch (action) {
			case AKeys.Enable:
				return message.language.get(LanguageKeys.Commands.Moderation.AutomaticParameterEnabled);
			case AKeys.Disable:
				return message.language.get(LanguageKeys.Commands.Moderation.AutomaticParameterDisabled);
			case AKeys.SoftAction: {
				return value
					? message.language.get(LanguageKeys.Commands.Moderation.AutomaticParameterSoftActionWithValue, { value: value as string })
					: message.language.get(LanguageKeys.Commands.Moderation.AutomaticParameterSoftAction);
			}
			case AKeys.HardAction:
				return message.language.get(LanguageKeys.Commands.Moderation.AutomaticParameterHardAction, { value: value as string });
			case AKeys.HardActionDuration: {
				return value
					? message.language.get(LanguageKeys.Commands.Moderation.AutomaticParameterHardActionDurationWithValue, { value: value as number })
					: message.language.get(LanguageKeys.Commands.Moderation.AutomaticParameterHardActionDuration);
			}
			case AKeys.ThresholdMaximum: {
				return value
					? message.language.get(LanguageKeys.Commands.Moderation.AutomaticParameterThresholdMaximumWithValue, { value: value as number })
					: message.language.get(LanguageKeys.Commands.Moderation.AutomaticParameterThresholdMaximum);
			}
			case AKeys.ThresholdDuration: {
				return value
					? message.language.get(LanguageKeys.Commands.Moderation.AutomaticParameterThresholdDurationWithValue, { value: value as number })
					: message.language.get(LanguageKeys.Commands.Moderation.AutomaticParameterThresholdDuration);
			}
			default:
				throw new Error('Unexpected.');
		}
	}

	private static displayHardAction(hardAction: SelfModeratorHardActionFlags | null) {
		switch (hardAction) {
			case SelfModeratorHardActionFlags.Ban:
				return LanguageKeys.Commands.Moderation.AutomaticValueHardActionBan;
			case SelfModeratorHardActionFlags.Kick:
				return LanguageKeys.Commands.Moderation.AutomaticValueHardActionKick;
			case SelfModeratorHardActionFlags.Mute:
				return LanguageKeys.Commands.Moderation.AutomaticValueHardActionMute;
			case SelfModeratorHardActionFlags.SoftBan:
				return LanguageKeys.Commands.Moderation.AutomaticValueHardActionSoftban;
			case SelfModeratorHardActionFlags.Warning:
				return LanguageKeys.Commands.Moderation.AutomaticValueHardActionWarning;
			default:
				return LanguageKeys.Commands.Moderation.AutomaticValueHardActionNone;
		}
	}

	private static has(bitfields: number, bitfield: number) {
		return (bitfields & bitfield) === bitfield;
	}

	private static toggle(bitfields: number, bitfield: number) {
		return SelfModerationCommand.has(bitfields, bitfield) ? bitfields & ~bitfield : bitfields | bitfield;
	}

	private static parseMaximum(message: KlasaMessage, key: SchemaEntry, input: string, name: string) {
		const parsed = Number(input);
		if (parsed < 0) throw message.language.get(LanguageKeys.Resolvers.InvalidInt, { name });
		if (key.minimum !== null && parsed < key.minimum)
			throw message.language.get(LanguageKeys.Commands.Moderation.AutomaticValueMaximumTooShort, { minimum: key.minimum, value: parsed });
		if (key.maximum !== null && parsed > key.maximum)
			throw message.language.get(LanguageKeys.Commands.Moderation.AutomaticValueMaximumTooLong, { maximum: key.maximum, value: parsed });
		return parsed;
	}

	private static parseDuration(message: KlasaMessage, key: SchemaEntry, input: string, name: string) {
		const parsed = new Duration(input);
		if (parsed.offset < 0) throw message.language.get(LanguageKeys.Resolvers.InvalidDuration, { name });
		if (key.minimum !== null && parsed.offset < key.minimum)
			throw message.language.get(LanguageKeys.Commands.Moderation.AutomaticValueDurationTooShort, {
				minimum: key.minimum,
				value: parsed.offset
			});
		if (key.maximum !== null && parsed.offset > key.maximum)
			throw message.language.get(LanguageKeys.Commands.Moderation.AutomaticValueDurationTooLong, {
				maximum: key.maximum,
				value: parsed.offset
			});
		return parsed.offset;
	}

	protected abstract $adder: keyof GuildSecurity['adders'];
	protected abstract keyEnabled: string;
	protected abstract keySoftAction: string;
	protected abstract keyHardAction: string;
	protected abstract keyHardActionDuration: string;
	protected abstract keyThresholdMaximum: string;
	protected abstract keyThresholdDuration: string;
}
