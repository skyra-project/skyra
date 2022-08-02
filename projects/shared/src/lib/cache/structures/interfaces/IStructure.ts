import type { NonNullObject } from '@sapphire/utilities';
import type { Reader } from '../../../data/Reader.js';
import type { BufferEncodable } from './BufferEncodable.js';
import type { Identifiable } from './Identifiable.js';
import type { JsonEncodable } from './JsonEncodable.js';

export interface IStructure extends BufferEncodable, JsonEncodable, Identifiable {}

export interface IStructureConstructor<T extends IStructure> {
	fromAPI(data: NonNullObject): T;
	fromBinary(reader: Reader): T;
}
