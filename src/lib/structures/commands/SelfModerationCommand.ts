import { AdderKey, configurableKeys, GuildEntity, SchemaKey } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import type { GuildMessage } from '#lib/types';
import { PermissionLevels } from '#lib/types/Enums';
import type { KeyOfType } from '#lib/types/Utils';
import { Duration } from '@sapphire/time-utilities';
import { codeBlock } from '@sapphire/utilities';
import type { TFunction } from 'i18next';
import type { PieceContext } from 'klasa';
import { SelfModeratorBitField, SelfModeratorHardActionFlags } from '../moderation/SelfModeratorBitField';
import { SkyraCommand } from './SkyraCommand';

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

export namespace SelfModerationCommand {
	/**
	 * The SelfModerationCommand Options
	 */
	export type Options = SkyraCommand.Options;
}

export abstract class SelfModerationCommand extends SkyraCommand {
	protected constructor(context: PieceContext, options: SelfModerationCommand.Options) {
		super(context, {
			cooldown: 5,
			permissionLevel: PermissionLevels.Administrator,
			runIn: ['text'],
			usage: '(action:action) (value:value)',
			usageDelim: ' ',
			...options
		});

		this.createCustomResolver('action', async (arg, _possible, message) => {
			if (typeof arg === 'undefined') return AKeys.Show;
			const action = kActions.get(arg.toLowerCase());
			if (typeof action === 'undefined') {
				throw await message.resolveKey(LanguageKeys.Commands.Moderation.AutomaticParameterInvalidMissingAction, { name: this.name });
			}

			return action;
		}).createCustomResolver('value', async (arg, _possible, message, [type]: AKeys[]) => {
			if (type === AKeys.Enable) return true;
			if (type === AKeys.Disable) return false;
			if (type === AKeys.Show) return null;
			if (!arg) {
				throw await message.resolveKey(LanguageKeys.Commands.Moderation.AutomaticParameterInvalidMissingArguments, { name: this.name });
			}

			if (type === AKeys.SoftAction) {
				const softAction = kSoftActions.get(arg.toLowerCase());
				if (typeof softAction === 'undefined') {
					throw await message.resolveKey(LanguageKeys.Commands.Moderation.AutomaticParameterInvalidSoftAction, { name: this.name });
				}

				const previousSoftAction = await message.guild!.readSettings(this.keySoftAction);
				return SelfModerationCommand.toggle(previousSoftAction, softAction);
			}

			if (type === AKeys.HardAction) {
				const hardAction = kHardActions.get(arg.toLowerCase());
				if (typeof hardAction === 'undefined') {
					throw await message.resolveKey(LanguageKeys.Commands.Moderation.AutomaticParameterInvalidHardAction, { name: this.name });
				}

				return hardAction;
			}

			if (type === AKeys.HardActionDuration) {
				if (/^(?:reset|0\w?)$/i.test(arg)) return null;
				const key = configurableKeys.get(this.keyHardActionDuration)!;
				return SelfModerationCommand.parseDuration(message as GuildMessage, key, arg, 'Hard Action Duration');
			}

			if (type === AKeys.ThresholdMaximum) {
				const key = configurableKeys.get(this.keyThresholdMaximum)!;
				return SelfModerationCommand.parseMaximum(message as GuildMessage, key, arg, 'Threshold Maximum');
			}

			if (type === AKeys.ThresholdDuration) {
				const key = configurableKeys.get(this.keyThresholdDuration)!;
				return SelfModerationCommand.parseDuration(message as GuildMessage, key, arg, 'Threshold Duration');
			}

			throw new Error('Unreachable.');
		});
	}

	public async run(message: GuildMessage, [action, value]: [AKeys, unknown]) {
		if (action === AKeys.Show) return this.show(message);

		const key = this.getProperty(action)!;
		const t = await message.guild.writeSettings((settings) => {
			Reflect.set(settings, key, value);
			return settings.getLanguage();
		});

		switch (action) {
			case AKeys.SoftAction: {
				value = SelfModerationCommand.displaySoftAction(t, value as number).join('`, `');
				break;
			}
			case AKeys.HardAction: {
				value = t(SelfModerationCommand.displayHardAction(value as SelfModeratorHardActionFlags));
				break;
			}
			case AKeys.Enable:
			case AKeys.Disable:
			case AKeys.ThresholdMaximum:
			case AKeys.ThresholdDuration:
			case AKeys.HardActionDuration:
				break;
		}

		return message.send(SelfModerationCommand.getLanguageKey(t, action, value));
	}

	protected async show(message: GuildMessage) {
		const [enabled, softAction, hardAction, hardActionDuration, adder, t] = await message.guild.readSettings((settings) => [
			settings[this.keyEnabled],
			settings[this.keySoftAction],
			settings[this.keyHardAction],
			settings[this.keyHardActionDuration],
			settings.adders[this.$adder],
			settings.getLanguage()
		]);

		const [yes, no] = [t(LanguageKeys.Resolvers.BoolEnabled), t(LanguageKeys.Resolvers.BoolDisabled)];
		return message.send(
			codeBlock(
				'prolog',
				t(LanguageKeys.Commands.Moderation.AutomaticParameterShow, {
					kEnabled: enabled ? yes : no,
					kAlert: SelfModerationCommand.has(softAction, ASKeys.Alert) ? yes : no,
					kLog: SelfModerationCommand.has(softAction, ASKeys.Log) ? yes : no,
					kDelete: SelfModerationCommand.has(softAction, ASKeys.Delete) ? yes : no,
					kHardAction: t(SelfModerationCommand.displayHardAction(hardAction)),
					hardActionDurationText:
						hardActionDuration === null
							? t(LanguageKeys.Commands.Moderation.AutomaticParameterShowDurationPermanent)
							: t(LanguageKeys.Globals.DurationValue, { value: hardActionDuration }),
					thresholdMaximumText: adder?.maximum ? adder.maximum : t(LanguageKeys.Commands.Moderation.AutomaticParameterShowUnset),
					thresholdDurationText: adder?.duration
						? t(LanguageKeys.Globals.DurationValue, { value: adder.duration })
						: t(LanguageKeys.Commands.Moderation.AutomaticParameterShowUnset),
					joinArrays: '\n'
				})
			)
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

	private static displaySoftAction(t: TFunction, softAction: number) {
		const actions: string[] = [];
		if (SelfModerationCommand.has(softAction, ASKeys.Alert)) actions.push(t(LanguageKeys.Commands.Moderation.AutomaticValueSoftActionAlert));
		if (SelfModerationCommand.has(softAction, ASKeys.Log)) actions.push(t(LanguageKeys.Commands.Moderation.AutomaticValueSoftActionLog));
		if (SelfModerationCommand.has(softAction, ASKeys.Delete)) actions.push(t(LanguageKeys.Commands.Moderation.AutomaticValueSoftActionDelete));
		return actions;
	}

	private static getLanguageKey(t: TFunction, action: AKeys, value: unknown) {
		switch (action) {
			case AKeys.Enable:
				return t(LanguageKeys.Commands.Moderation.AutomaticParameterEnabled);
			case AKeys.Disable:
				return t(LanguageKeys.Commands.Moderation.AutomaticParameterDisabled);
			case AKeys.SoftAction: {
				return value
					? t(LanguageKeys.Commands.Moderation.AutomaticParameterSoftActionWithValue, { value: value as string })
					: t(LanguageKeys.Commands.Moderation.AutomaticParameterSoftAction);
			}
			case AKeys.HardAction:
				return t(LanguageKeys.Commands.Moderation.AutomaticParameterHardAction, { value: value as string });
			case AKeys.HardActionDuration: {
				return value
					? t(LanguageKeys.Commands.Moderation.AutomaticParameterHardActionDurationWithValue, { value: value as number })
					: t(LanguageKeys.Commands.Moderation.AutomaticParameterHardActionDuration);
			}
			case AKeys.ThresholdMaximum: {
				return value
					? t(LanguageKeys.Commands.Moderation.AutomaticParameterThresholdMaximumWithValue, { value: value as number })
					: t(LanguageKeys.Commands.Moderation.AutomaticParameterThresholdMaximum);
			}
			case AKeys.ThresholdDuration: {
				return value
					? t(LanguageKeys.Commands.Moderation.AutomaticParameterThresholdDurationWithValue, { value: value as number })
					: t(LanguageKeys.Commands.Moderation.AutomaticParameterThresholdDuration);
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
				return LanguageKeys.Commands.Moderation.AutomaticValueHardActionSoftBan;
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

	private static async parseMaximum(message: GuildMessage, key: SchemaKey, input: string, name: string) {
		const parsed = Number(input);
		if (!Number.isInteger(input) || parsed < 0) {
			throw await message.resolveKey(LanguageKeys.Resolvers.InvalidInt, { name });
		}

		if (key.minimum !== null && parsed < key.minimum) {
			throw await message.resolveKey(LanguageKeys.Commands.Moderation.AutomaticValueMaximumTooShort, { minimum: key.minimum, value: parsed });
		}

		if (key.maximum !== null && parsed > key.maximum) {
			throw await message.resolveKey(LanguageKeys.Commands.Moderation.AutomaticValueMaximumTooLong, { maximum: key.maximum, value: parsed });
		}
		return parsed;
	}

	private static async parseDuration(message: GuildMessage, key: SchemaKey, input: string, name: string) {
		const parsed = new Duration(input);
		if (!Number.isInteger(input) || parsed.offset < 0) {
			throw await message.resolveKey(LanguageKeys.Resolvers.InvalidDuration, { name });
		}

		if (key.minimum !== null && parsed.offset < key.minimum) {
			throw await message.resolveKey(LanguageKeys.Commands.Moderation.AutomaticValueDurationTooShort, {
				minimum: key.minimum,
				value: parsed.offset
			});
		}

		if (key.maximum !== null && parsed.offset > key.maximum) {
			throw await message.resolveKey(LanguageKeys.Commands.Moderation.AutomaticValueDurationTooLong, {
				maximum: key.maximum,
				value: parsed.offset
			});
		}

		return parsed.offset;
	}

	protected abstract $adder: AdderKey;
	protected abstract keyEnabled: KeyOfType<GuildEntity, boolean>;
	protected abstract keySoftAction: KeyOfType<GuildEntity, number>;
	protected abstract keyHardAction: KeyOfType<GuildEntity, number | null>;
	protected abstract keyHardActionDuration: KeyOfType<GuildEntity, number | null>;
	protected abstract keyThresholdMaximum: KeyOfType<GuildEntity, number | null>;
	protected abstract keyThresholdDuration: KeyOfType<GuildEntity, number | null>;
}
