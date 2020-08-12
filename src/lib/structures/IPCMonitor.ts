import { Piece } from 'klasa';

export abstract class IPCMonitor extends Piece {
	public abstract run(message: unknown): unknown;
}
