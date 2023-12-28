import { configurableKeys, readSettings, writeSettings, type AdderKey, type GuildSettingsOfType } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SelfModeratorBitField, SelfModeratorHardActionFlags } from '#lib/moderation/structures/SelfModeratorBitField';
import { SkyraCommand } from '#lib/structures';
import { PermissionLevels, type GuildMessage } from '#lib/types';
import { CommandOptionsRunTypeEnum } from '@sapphire/framework';
import { send } from '@sapphire/plugin-editable-commands';
import type { TFunction } from '@sapphire/plugin-i18next';
import { codeBlock } from '@sapphire/utilities';

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
	['threshold', AKeys.ThresholdMaximum],
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

export abstract class SelfModerationCommand extends SkyraCommand {
	protected constructor(context: SkyraCommand.LoaderContext, options: SelfModerationCommand.Options) {
		super(context, {
			permissionLevel: PermissionLevels.Administrator,
			runIn: [CommandOptionsRunTypeEnum.GuildAny],
			...options
		});
	}

	public override async messageRun(message: GuildMessage, args: SkyraCommand.Args) {
		const type = this.getAction(args);
		if (type === AKeys.Show) return this.show(message);

		let value = (await this.getValue(args, type)) as unknown;

		const key = this.getProperty(type)!;
		const t = await writeSettings(message.guild, (settings) => {
			Reflect.set(settings, key, value);
			return settings.getLanguage();
		});

		switch (type) {
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

		const content = SelfModerationCommand.getLanguageKey(t, type, value);
		return send(message, content);
	}

	protected async show(message: GuildMessage) {
		const [enabled, softAction, hardAction, hardActionDuration, adder, t] = await readSettings(message.guild, (settings) => [
			settings[this.keyEnabled],
			settings[this.keySoftAction],
			settings[this.keyHardAction],
			settings[this.keyHardActionDuration],
			settings.adders[this.$adder],
			settings.getLanguage()
		]);

		const [yes, no] = [t(LanguageKeys.Arguments.BooleanEnabled), t(LanguageKeys.Arguments.BooleanDisabled)];
		const codeBlockContent = t(LanguageKeys.Commands.Moderation.AutomaticParameterShow, {
			kEnabled: enabled ? yes : no,
			kAlert: SelfModerationCommand.has(softAction, ASKeys.Alert) ? yes : no,
			kLog: SelfModerationCommand.has(softAction, ASKeys.Log) ? yes : no,
			kDelete: SelfModerationCommand.has(softAction, ASKeys.Delete) ? yes : no,
			kHardAction: t(SelfModerationCommand.displayHardAction(hardAction)),
			hardActionDurationText: hardActionDuration
				? t(LanguageKeys.Globals.DurationValue, { value: hardActionDuration })
				: t(LanguageKeys.Commands.Moderation.AutomaticParameterShowDurationPermanent),
			thresholdMaximumText: adder?.maximum ? adder.maximum : t(LanguageKeys.Commands.Moderation.AutomaticParameterShowUnset),
			thresholdDurationText: adder?.duration
				? t(LanguageKeys.Globals.DurationValue, { value: adder.duration })
				: t(LanguageKeys.Commands.Moderation.AutomaticParameterShowUnset),
			joinArrays: '\n'
		});
		const content = codeBlock('prolog', codeBlockContent);
		return send(message, content);
	}

	private getAction(args: SkyraCommand.Args) {
		if (args.finished) return AKeys.Show;

		const action = kActions.get(args.next().toLowerCase());
		if (typeof action === 'undefined') {
			return this.error(LanguageKeys.Commands.Moderation.AutomaticParameterInvalidMissingAction, { name: this.name });
		}

		return action;
	}

	private async getValue(args: SkyraCommand.Args, type: AKeys) {
		if (type === AKeys.Enable) return true;
		if (type === AKeys.Disable) return false;
		if (type === AKeys.Show) return null;
		if (args.finished) this.error(LanguageKeys.Commands.Moderation.AutomaticParameterInvalidMissingArguments, { name: this.name });

		if (type === AKeys.SoftAction) {
			const softAction = kSoftActions.get(args.next().toLowerCase());
			if (typeof softAction === 'undefined') {
				this.error(LanguageKeys.Commands.Moderation.AutomaticParameterInvalidSoftAction, { name: this.name });
			}

			const previousSoftAction = await readSettings(args.message.guild!, this.keySoftAction);
			return SelfModerationCommand.toggle(previousSoftAction, softAction);
		}

		if (type === AKeys.HardAction) {
			const hardAction = kHardActions.get(args.next().toLowerCase());
			if (typeof hardAction === 'undefined') {
				this.error(LanguageKeys.Commands.Moderation.AutomaticParameterInvalidHardAction, { name: this.name });
			}

			return hardAction;
		}

		if (type === AKeys.HardActionDuration) {
			const key = configurableKeys.get(this.keyHardActionDuration)!;
			return args.pick('timespan', { minimum: key.minimum, maximum: key.maximum });
		}

		if (type === AKeys.ThresholdMaximum) {
			const key = configurableKeys.get(this.keyThresholdMaximum)!;
			return args.pick('integer', { minimum: key.minimum, maximum: key.maximum });
		}

		if (type === AKeys.ThresholdDuration) {
			const key = configurableKeys.get(this.keyThresholdDuration)!;
			return args.pick('timespan', { minimum: key.minimum, maximum: key.maximum });
		}

		throw new Error('Unreachable');
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

	protected abstract $adder: AdderKey;
	protected abstract keyEnabled: GuildSettingsOfType<boolean>;
	protected abstract keySoftAction: GuildSettingsOfType<number>;
	protected abstract keyHardAction: GuildSettingsOfType<number | null>;
	protected abstract keyHardActionDuration: GuildSettingsOfType<number | null>;
	protected abstract keyThresholdMaximum: GuildSettingsOfType<number | null>;
	protected abstract keyThresholdDuration: GuildSettingsOfType<number | null>;
}

export namespace SelfModerationCommand {
	/**
	 * The SelfModerationCommand Options
	 */
	export type Options = SkyraCommand.Options;

	export type Args = SkyraCommand.Args;
}
