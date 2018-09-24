import { Piece } from 'klasa';
import { APIResponse } from '../types/skyra';

export default abstract class API extends Piece {

	public abstract run(data: any): Promise<APIResponse>;

}
