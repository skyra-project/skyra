import { FT, T } from '#lib/types';

export const FetchNoMatches = T<string>('musicManager:fetchNoMatches');
export const FetchLoadFailed = T<string>('musicManager:fetchLoadFailed');
export const ImportQueueNotFound = T<string>('musicManager:importQueueNotFound');
export const ImportQueueError = T<string>('musicManager:importQueueError');
export const TooManySongs = T<string>('musicManager:tooManySongs');
export const Stuck = FT<{ milliseconds: number }, string>('musicManager:stuck');
