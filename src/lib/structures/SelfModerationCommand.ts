import { mergeDefault } from '@klasa/utils';
import { PermissionLevels } from '@lib/types/Enums';
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
		super(
			store,
			file,
			directory,
			mergeDefault<Partial<CommandOptions>, CommandOptions>(
				{
					cooldown: 5,
					permissionLevel: PermissionLevels.Administrator,
					runIn: ['text'],
					usage: '(action:action) (value:value)',
					usageDelim: ' '
				},
				options
			) as CommandOptions
		);

		this.createCustomResolver('action', (arg, _possible, message) => {
			if (typeof arg === 'undefined') return AKeys.Show;
			const action = kActions.get(arg.toLowerCase());
			if (typeof action === 'undefined') throw message.language.tget('SELF_MODERATION_COMMAND_INVALID_MISSING_ACTION', this.name);
			return action;
		}).createCustomResolver('value', (arg, _possible, message, [type]: AKeys[]) => {
			if (type === AKeys.Enable) return true;
			if (type === AKeys.Disable) return false;
			if (type === AKeys.Show) return null;
			if (!arg) throw message.language.tget('SELF_MODERATION_COMMAND_INVALID_MISSING_ARGUMENTS', this.name);

			if (type === AKeys.SoftAction) {
				const softAction = kSoftActions.get(arg.toLowerCase());
				if (typeof softAction === 'undefined') throw message.language.tget('SELF_MODERATION_COMMAND_INVALID_SOFTACTION', this.name);
				const previousSoftAction = message.guild!.settings.get(this.keySoftAction) as number;
				return SelfModerationCommand.toggle(previousSoftAction, softAction);
			}

			if (type === AKeys.HardAction) {
				const hardAction = kHardActions.get(arg.toLowerCase());
				if (typeof hardAction === 'undefined') throw message.language.tget('SELF_MODERATION_COMMAND_INVALID_HARDACTION', this.name);
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
				value = message.language.tget(SelfModerationCommand.displayHardAction(value as SelfModeratorHardActionFlags));
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

		return message.sendLocale(SelfModerationCommand.getLanguageKey(action), [value]);
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

		const i18n = message.language.tget.bind(message.language);
		const [yes, no] = [i18n('SELF_MODERATION_ENABLED'), i18n('SELF_MODERATION_DISABLED')];
		return message.sendCode(
			'prolog',
			i18n(
				'SELF_MODERATION_COMMAND_SHOW',
				enabled ? yes : no,
				SelfModerationCommand.has(softAction, ASKeys.Alert) ? yes : no,
				SelfModerationCommand.has(softAction, ASKeys.Log) ? yes : no,
				SelfModerationCommand.has(softAction, ASKeys.Delete) ? yes : no,
				i18n(SelfModerationCommand.displayHardAction(hardAction)),
				hardActionDuration,
				thresholdMaximum,
				thresholdDuration
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
		if (SelfModerationCommand.has(softAction, ASKeys.Alert)) actions.push(message.language.tget('SELF_MODERATION_SOFT_ACTION_ALERT'));
		if (SelfModerationCommand.has(softAction, ASKeys.Log)) actions.push(message.language.tget('SELF_MODERATION_SOFT_ACTION_LOG'));
		if (SelfModerationCommand.has(softAction, ASKeys.Delete)) actions.push(message.language.tget('SELF_MODERATION_SOFT_ACTION_DELETE'));
		return actions;
	}

	private static getLanguageKey(action: AKeys) {
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

	private static displayHardAction(hardAction: SelfModeratorHardActionFlags | null) {
		switch (hardAction) {
			case SelfModeratorHardActionFlags.Ban:
				return 'SELF_MODERATION_HARD_ACTION_BAN';
			case SelfModeratorHardActionFlags.Kick:
				return 'SELF_MODERATION_HARD_ACTION_KICK';
			case SelfModeratorHardActionFlags.Mute:
				return 'SELF_MODERATION_HARD_ACTION_MUTE';
			case SelfModeratorHardActionFlags.SoftBan:
				return 'SELF_MODERATION_HARD_ACTION_SOFTBAN';
			case SelfModeratorHardActionFlags.Warning:
				return 'SELF_MODERATION_HARD_ACTION_WARNING';
			default:
				return 'SELF_MODERATION_HARD_ACTION_NONE';
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
		if (parsed < 0) throw message.language.tget('RESOLVER_INVALID_INT', { name });
		if (key.minimum !== null && parsed < key.minimum) throw message.language.tget('SELF_MODERATION_MAXIMUM_TOO_SHORT', key.minimum, parsed);
		if (key.maximum !== null && parsed > key.maximum) throw message.language.tget('SELF_MODERATION_MAXIMUM_TOO_LONG', key.maximum, parsed);
		return parsed;
	}

	private static parseDuration(message: KlasaMessage, key: SchemaEntry, input: string, name: string) {
		const parsed = new Duration(input);
		if (parsed.offset < 0) throw message.language.tget('RESOLVER_INVALID_DURATION', { name });
		if (key.minimum !== null && parsed.offset < key.minimum)
			throw message.language.tget('SELF_MODERATION_DURATION_TOO_SHORT', key.minimum, parsed.offset);
		if (key.maximum !== null && parsed.offset > key.maximum)
			throw message.language.tget('SELF_MODERATION_DURATION_TOO_LONG', key.maximum, parsed.offset);
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
