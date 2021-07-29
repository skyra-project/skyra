import type { BaseEntity } from 'typeorm';

export interface IBaseEntity extends BaseEntity {
	resetAll(): void;
}
