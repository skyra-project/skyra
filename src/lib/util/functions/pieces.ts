import type { Piece } from '@sapphire/framework';
import { bgBlue, bgRed } from 'colorette';

export function getLogPrefix(piece: Piece) {
	return bgBlue(`[ ${piece.store.name} => ${piece.name} ]`);
}

export function getCodeStyle(code: string | number) {
	return bgRed(`[ ${code} ]`);
}
