import { Command, CommandStore, CommandOptions, util, SchemaEntry, KlasaMessage } from 'klasa';
import { PermissionLevels } from '../types/Enums';
import { SelfModeratorHardActionFlags, SelfModeratorBitField } from './SelfModeratorBitField';
import { GuildSecurity } from '../util/Security/GuildSecurity';
import { Adder } from '../util/Adder';

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
	['e', AKeys.Enable], ['enable', AKeys.Enable], ['on', AKeys.Enable],
	['d', AKeys.Disable], ['disable', AKeys.Disable], ['off', AKeys.Disable],
	['a', AKeys.SoftAction], ['action', AKeys.SoftAction], ['soft-action', AKeys.SoftAction],
	['p', AKeys.HardAction], ['punish', AKeys.HardAction], ['punishment', AKeys.HardAction],
	['pd', AKeys.HardActionDuration], ['punish-duration', AKeys.HardActionDuration], ['punishment-duration', AKeys.HardActionDuration],
	['t', AKeys.ThresholdMaximum], ['tm', AKeys.ThresholdMaximum], ['threshold-maximum', AKeys.ThresholdMaximum],
	['td', AKeys.HardActionDuration], ['threshold-duration', AKeys.ThresholdDuration],
	['s', AKeys.Show], ['sh', AKeys.Show], ['show', AKeys.Show], ['display', AKeys.Show]
]);

export enum ASKeys {
	Alert = SelfModeratorBitField.FLAGS.ALERT,
	Log = SelfModeratorBitField.FLAGS.LOG,
	Delete = SelfModeratorBitField.FLAGS.DELETE
}

export const kSoftActions = new Map<string, ASKeys>([
	['a', ASKeys.Alert], ['al', ASKeys.Alert], ['alert', ASKeys.Alert],
	['l', ASKeys.Log], ['log', ASKeys.Log],
	['d', ASKeys.Delete], ['del', ASKeys.Delete], ['delete', ASKeys.Delete]
]);

export const kHardActions = new Map<string, SelfModeratorHardActionFlags>([
	['w', SelfModeratorHardActionFlags.Warning], ['warn', SelfModeratorHardActionFlags.Warning], ['warning', SelfModeratorHardActionFlags.Warning],
	['m', SelfModeratorHardActionFlags.Mute], ['mute', SelfModeratorHardActionFlags.Mute],
	['k', SelfModeratorHardActionFlags.Kick], ['kick', SelfModeratorHardActionFlags.Kick],
	['sb', SelfModeratorHardActionFlags.SoftBan], ['softban', SelfModeratorHardActionFlags.SoftBan], ['soft-ban', SelfModeratorHardActionFlags.SoftBan],
	['b', SelfModeratorHardActionFlags.Ban], ['ban', SelfModeratorHardActionFlags.Ban]
]);

export abstract class SelfModerationCommand extends Command {

	public constructor(store: CommandStore, file: string[], directory: string, options: CommandOptions = {}) {
		super(store, file, directory, util.mergeDefault({
			cooldown: 5,
			permissionLevel: PermissionLevels.Administrator,
			runIn: ['text'],
			usage: '(action:action) (value:value)',
			usageDelim: ' '
		} as CommandOptions, options));

		this.createCustomResolver('action', arg => {
			if (typeof arg === 'undefined') return AKeys.Show;
			const action = kActions.get(arg.toLowerCase());
			if (typeof action === 'undefined') throw `Action must be any of the following: "enable", "disable", "action", "punish", "punish-duration", "threshold-maximum", "threshold-duration", or "show". Check \`Skyra, help ${this.name}\` for more information.`;
			return action;
		}).createCustomResolver('value', (arg, _possible, message, [type]: AKeys[]) => {
			if (type === AKeys.Enable) return true;
			if (type === AKeys.Disable) return false;
			if (type === AKeys.Show) return null;
			if (!arg) throw `The specified action requires an extra argument to be passed. Check \`Skyra, help ${this.name}\` for more information.`;

			if (type === AKeys.SoftAction) {
				const softAction = kSoftActions.get(arg.toLowerCase());
				if (typeof softAction === 'undefined') throw `Value must be any of the following: "alert", "log", or "delete". Check \`Skyra, help ${this.name}\` for more information.`;
				const previousSoftAction = message.guild!.settings.get(this.keySoftAction) as number;
				return this.toggle(previousSoftAction, softAction);
			}

			if (type === AKeys.HardAction) {
				const hardAction = kHardActions.get(arg.toLowerCase());
				if (typeof hardAction === 'undefined') throw `Value must be any of the following: "warn", "mute", "kick", "softban", or "ban". Check \`Skyra, help ${this.name}\` for more information.`;
				return hardAction;
			}

			if (type === AKeys.HardActionDuration) {
				const key = message.guild!.settings.schema.get(this.keyHardActionDuration) as SchemaEntry;
				return key.parse(arg, message.guild!);
			}

			if (type === AKeys.ThresholdMaximum) {
				const key = message.guild!.settings.schema.get(this.keyThresholdMaximum) as SchemaEntry;
				return key.parse(arg, message.guild!);
			}

			if (type === AKeys.ThresholdDuration) {
				const key = message.guild!.settings.schema.get(this.keyThresholdDuration) as SchemaEntry;
				return key.parse(arg, message.guild!);
			}

			throw new Error('Unreachable.');
		});
	}

	public async run(message: KlasaMessage, [action, value]: [AKeys, unknown]) {
		if (action === AKeys.Show) return this.show(message);

		const key = this.getProperty(action)!;
		await message.guild!.settings.update(key, value, { throwOnError: true });

		switch (action) {
			case AKeys.Disable: {
				message.guild!.security.adders[this.$adder] = null;
				break;
			}
			case AKeys.SoftAction: {
				value = this.displaySoftAction(message, value as number).join('`, `');
				break;
			}
			case AKeys.HardAction: {
				value = message.language.get(this.displayHardAction(value as SelfModeratorHardActionFlags));
				break;
			}
			case AKeys.Enable:
			case AKeys.ThresholdMaximum:
			case AKeys.ThresholdDuration: {
				this.manageAdder(message);
			}
		}

		return message.sendLocale(this.getLanguageKey(action), [value]);
	}

	protected show(message: KlasaMessage) {
		const { settings } = message.guild!;
		const [enabled, softAction, hardAction, hardActionDuration, thresholdMaximum, thresholdDuration] = settings.pluck(
			this.keyEnabled, this.keySoftAction, this.keyHardAction, this.keyHardActionDuration, this.keyThresholdMaximum,
			this.keyThresholdDuration
		);

		const i18n = message.language.get.bind(message.language);
		const [yes, no] = [i18n('SELF_MODERATION_ENABLED'), i18n('SELF_MODERATION_DISABLED')];
		return message.sendCode('prolog', i18n(
			'SELF_MODERATION_COMMAND_SHOW',
			enabled ? yes : no,
			this.has(softAction, ASKeys.Alert) ? yes : no,
			this.has(softAction, ASKeys.Log) ? yes : no,
			this.has(softAction, ASKeys.Delete) ? yes : no,
			i18n(this.displayHardAction(hardAction)),
			hardActionDuration,
			thresholdMaximum,
			thresholdDuration
		));
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

	private getLanguageKey(action: AKeys) {
		switch (action) {
			case AKeys.Enable:
				return 'SELF_MODERATION_COMMAND_ENABLED';
			case AKeys.Disable:
				return 'SELF_MODERATION_COMMAND_DISABLED';
			case AKeys.SoftAction:
				return 'SELF_MODERATION_COMMAND_SOFT_ACTION';
			case AKeys.HardAction:
				return 'SELF_MODERATION_COMMAND_HARD_ACTION';
			case AKeys.HardActionDuration:
				return 'SELF_MODERATION_COMMAND_HARD_ACTION_DURATION';
			case AKeys.ThresholdMaximum:
				return 'SELF_MODERATION_COMMAND_THRESHOLD_MAXIMUM';
			case AKeys.ThresholdDuration:
				return 'SELF_MODERATION_COMMAND_THRESHOLD_DURATION';
			default:
				throw new Error('Unexpected.');
		}
	}

	private displaySoftAction(message: KlasaMessage, softAction: number) {
		const actions: string[] = [];
		if (this.has(softAction, ASKeys.Alert)) actions.push(message.language.get('SELF_MODERATION_SOFT_ACTION_ALERT'));
		if (this.has(softAction, ASKeys.Log)) actions.push(message.language.get('SELF_MODERATION_SOFT_ACTION_LOG'));
		if (this.has(softAction, ASKeys.Delete)) actions.push(message.language.get('SELF_MODERATION_SOFT_ACTION_DELETE'));
		return actions;
	}

	private displayHardAction(hardAction: SelfModeratorHardActionFlags | null) {
		switch (hardAction) {
			case SelfModeratorHardActionFlags.Ban: return 'SELF_MODERATION_HARD_ACTION_BAN';
			case SelfModeratorHardActionFlags.Kick: return 'SELF_MODERATION_HARD_ACTION_KICK';
			case SelfModeratorHardActionFlags.Mute: return 'SELF_MODERATION_HARD_ACTION_MUTE';
			case SelfModeratorHardActionFlags.SoftBan: return 'SELF_MODERATION_HARD_ACTION_SOFTBAN';
			case SelfModeratorHardActionFlags.Warning: return 'SELF_MODERATION_HARD_ACTION_WARNING';
			default: return 'SELF_MODERATION_HARD_ACTION_NONE';
		}
	}

	private has(bitfields: number, bitfield: number) {
		return (bitfields & bitfield) === bitfield;
	}

	private toggle(bitfields: number, bitfield: number) {
		return this.has(bitfields, bitfield) ? bitfields & ~bitfield : bitfields | bitfield;
	}

	private manageAdder(message: KlasaMessage) {
		const [maximum, duration] = message.guild!.settings.pluck(this.keyThresholdMaximum, this.keyThresholdDuration);
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

	protected abstract $adder: keyof GuildSecurity['adders'];
	protected abstract keyEnabled: string;
	protected abstract keySoftAction: string;
	protected abstract keyHardAction: string;
	protected abstract keyHardActionDuration: string;
	protected abstract keyThresholdMaximum: string;
	protected abstract keyThresholdDuration: string;

}
