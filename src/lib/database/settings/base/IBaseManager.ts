export interface IBaseManager {
	refresh(): void;
	onPatch(): void;
	onRemove(): void;
}
