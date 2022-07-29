import type { BufferEncodable } from './BufferEncodable';
import type { Identifiable } from './Identifiable';
import type { JsonEncodable } from './JsonEncodable';

export interface IStructure extends BufferEncodable, JsonEncodable, Identifiable {}
