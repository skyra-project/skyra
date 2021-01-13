import { FT, T } from '#lib/types';

export const FetchNoArguments = T<string>('musicManager:fetchNoArguments');
export const FetchNoMatches = T<string>('musicManager:fetchNoMatches');
export const FetchLoadFailed = T<string>('musicManager:fetchLoadFailed');
export const ImportQueueNotFound = T<string>('musicManager:importQueueNotFound');
export const ImportQueueError = T<string>('musicManager:importQueueError');
export const TooManySongs = T<string>('musicManager:tooManySongs');
export const SetvolumeSilent = T<string>('musicManager:setvolumeSilent');
export const SetvolumeLoud = T<string>('musicManager:setvolumeLoud');
export const PlayNoSongs = T<string>('musicManager:playNoSongs');
export const PlayPlaying = T<string>('musicManager:playPlaying');
export const Stuck = FT<{ milliseconds: number }, string>('musicManager:stuck');
