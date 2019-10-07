import { Command, CommandStore, CommandOptions, util, SchemaEntry, KlasaMessage } from 'klasa';
import { PermissionLevels } from '../types/Enums';
import { SelfModeratorHardActionFlags, SelfModeratorBitField } from './SelfModeratorBitField';
import { GuildSecurity } from '../util/Security/GuildSecurity';
import { Adder } from '../util/Adder';

export enum AKeys {
	Enable,
	Disable,
	Maximum,
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
	['m', AKeys.Maximum], ['maximum', AKeys.Maximum],
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
			// TODO(kyranet): i18n this
			if (typeof action === 'undefined') throw 'Invalid action.';
			return action;
		}).createCustomResolver('value', (arg, _possible, message, [type]: AKeys[]) => {
			if (type === AKeys.Enable) return true;
			if (type === AKeys.Disable) return false;
			if (type === AKeys.Show) return null;
			if (!arg) throw 'Required value.';

			if (type === AKeys.SoftAction) {
				const softAction = kSoftActions.get(arg.toLowerCase());
				if (typeof softAction === 'undefined') throw 'Invalid message action.';
				return softAction;
			}

			if (type === AKeys.HardAction) {
				const hardAction = kHardActions.get(arg.toLowerCase());
				if (typeof hardAction === 'undefined') throw 'Invalid user action.';
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

		const key = this.getProperty(action);
		await message.guild!.settings.update(key, value, { throwOnError: true });

		switch (action) {
			case AKeys.Disable: {
				message.guild!.security.adders[this.$adder] = null;
				return message.sendMessage('Disabled.');
			}
			case AKeys.Enable:
			case AKeys.ThresholdMaximum:
			case AKeys.ThresholdDuration: {
				const [maximum, duration] = message.guild!.settings.pluck(this.keyThresholdMaximum, this.keyThresholdDuration);
				const adder = message.guild!.security.adders[this.$adder];
				if (adder === null) {
					message.guild!.security.adders[this.$adder] = new Adder(maximum, duration);
				} else {
					adder.maximum = maximum;
					adder.duration = duration;
				}
			}
		}

		return message.sendMessage('Updated!');
	}

	protected show(message: KlasaMessage) {
		return message;
	}

	private getProperty(action: AKeys) {
		switch (action) {
			case AKeys.Enable:
			case AKeys.Disable:
				return this.keyEnabled;
			case AKeys.Maximum:
				return this.keyMaximum;
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

	protected abstract $adder: keyof GuildSecurity['adders'];
	protected abstract keyEnabled: string;
	protected abstract keyMaximum: string;
	protected abstract keySoftAction: string;
	protected abstract keyHardAction: string;
	protected abstract keyHardActionDuration: string;
	protected abstract keyThresholdMaximum: string;
	protected abstract keyThresholdDuration: string;

}
