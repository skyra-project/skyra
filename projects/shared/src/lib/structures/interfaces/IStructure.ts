import type { NonNullObject } from '@sapphire/utilities';
import type { Reader } from '../../data/Reader';
import type { BufferEncodable } from './BufferEncodable';
import type { Identifiable } from './Identifiable';
import type { JsonEncodable } from './JsonEncodable';

export interface IStructure extends BufferEncodable, JsonEncodable, Identifiable {}

export interface IStructureConstructor<T extends IStructure> {
	fromAPI(data: NonNullObject): T;
	fromBinary(reader: Reader): T;
}
