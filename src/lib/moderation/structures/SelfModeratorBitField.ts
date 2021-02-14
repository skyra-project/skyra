import { BitField } from 'discord.js';

export class SelfModeratorBitField extends BitField<SelfModeratorBitFieldString> {
	public static FLAGS: Record<SelfModeratorBitFieldString, number> = {
		DELETE: 1 << 0,
		LOG: 1 << 1,
		ALERT: 1 << 2
	};

	public static ALL = SelfModeratorBitField.FLAGS.ALERT | SelfModeratorBitField.FLAGS.LOG | SelfModeratorBitField.FLAGS.DELETE;
}

/**
 * The bitfields for the SelfModeratorBitField
 */
export type SelfModeratorBitFieldString = 'DELETE' | 'LOG' | 'ALERT';

export enum SelfModeratorHardActionFlags {
	None,
	Warning,
	Kick,
	Mute,
	SoftBan,
	Ban
}
