export const enum TypeVariation {
	Ban,
	Kick,
	Mute,
	Softban,
	VoiceKick,
	VoiceMute,
	Warning,
	RestrictedReaction,
	RestrictedEmbed,
	RestrictedAttachment,
	RestrictedVoice,
	SetNickname,
	RoleAdd,
	RoleRemove,
	RestrictedEmoji,
	Timeout
}

export const enum TypeMetadata {
	None = 0,
	Undo = 1 << 0,
	Temporary = 1 << 1,
	/** @deprecated Use Temporary instead */
	Fast = 1 << 2,
	Archived = 1 << 3,
	Completed = 1 << 4
}

export const enum SchemaKeys {
	Case = 'caseID',
	CreatedAt = 'createdAt',
	Duration = 'duration',
	ExtraData = 'extraData',
	Guild = 'guildID',
	Moderator = 'moderatorID',
	Reason = 'reason',
	ImageURL = 'imageURL',
	Type = 'type',
	User = 'userID'
}

export interface ModerationTypeAssets {
	color: number;
	title: string;
}

export interface Unlock {
	unlock(): void;
}
