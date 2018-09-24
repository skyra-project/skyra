import { Piece } from 'klasa';

export default abstract class RawEvent extends Piece {

	public abstract async run<T>(processed: T): Promise<void>;
	public abstract async process<T>(): Promise<T>;

}

module.exports = RawEvent;
