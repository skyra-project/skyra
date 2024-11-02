import type { GuildMember, Message, OmitPartialGroupDMChannel } from 'discord.js';

export type GuildMessage = Message<true> & { member: GuildMember };
export type DMMessage = Message<false>;
export type NonGroupMessage = OmitPartialGroupDMChannel<Message<boolean>>;
