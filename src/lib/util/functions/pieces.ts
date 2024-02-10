import { Piece } from '@sapphire/framework';
import { bgBlue, bgRed } from 'colorette';

export function getLogPrefix(piece: Piece | string) {
	return bgBlue(piece instanceof Piece ? `[ ${piece.store.name} => ${piece.name} ]` : `[ ${piece} ]`);
}

export function getCodeStyle(code: string | number) {
	return bgRed(`[ ${code} ]`);
}
