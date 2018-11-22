import { Piece } from 'klasa';
import { IPCMonitorStore } from './IPCMonitorStore';

export abstract class IPCMonitor extends Piece {

	/**
	 * The store that manages this instance
	 */
	// @ts-ignore
	public store: IPCMonitorStore;

	public abstract async run(message: any): Promise<any>;

}
