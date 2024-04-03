import { BitField } from '@sapphire/bitfield';

export const AutoModerationOnInfraction = new BitField({
	Delete: 1 << 0,
	Log: 1 << 1,
	Alert: 1 << 2
});

export enum SelfModeratorHardActionFlags {
	None,
	Warning,
	Kick,
	Mute,
	Softban,
	Ban,
	Timeout
}
