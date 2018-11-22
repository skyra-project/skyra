import { Piece } from 'klasa';

export abstract class RawEvent extends Piece {

	public abstract run(data: any): Promise<void>;

}
