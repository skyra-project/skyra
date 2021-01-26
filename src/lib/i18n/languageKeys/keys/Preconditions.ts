import { FT, T } from '#lib/types';

// Sapphire built-in:
export const Cooldown = FT<{ remaining: number }, string>('preconditions:cooldown');
export const DMOnly = T<string>('preconditions:dmOnly');
export const GuildOnly = T<string>('preconditions:guildOnly');
export const NSFW = T<string>('preconditions:nsfw');
export const Permissions = FT<{ missing: string[] }, string>('preconditions:permissions');
export const DisabledGlobal = T<string>('preconditions:disabledGlobal');

// Skyra:
export const TextOnly = T<string>('preconditions:textOnly');
export const NewsOnly = T<string>('preconditions:newsOnly');
export const Spam = FT<{ channel: string }, string>('preconditions:spam');
export const MusicQueueEmpty = T<string>('preconditions:musicQueueEmpty');
export const MusicNotPlaying = T<string>('preconditions:musicNotPlaying');
export const MusicPaused = T<string>('preconditions:musicPaused');
export const MusicDjMember = T<string>('preconditions:musicDjMember');
export const MusicUserVoiceChannel = T<string>('preconditions:musicUserVoiceChannel');
export const MusicBotVoiceChannel = T<string>('preconditions:musicBotVoiceChannel');
export const MusicBothVoiceChannel = T<string>('preconditions:musicBothVoiceChannel');
export const MusicNothingPlaying = T<string>('preconditions:musicNothingPlaying');
