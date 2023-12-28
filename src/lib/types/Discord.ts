import type { GuildMember, Message } from 'discord.js';

export type GuildMessage = Message<true> & { member: GuildMember };
export type DMMessage = Message<false>;
