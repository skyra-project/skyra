import { Store } from 'klasa';
import Skyra from '../Skyra';
import RawEvent from './RawEvent';

export default class RawEventStore extends Store<string, RawEvent> {

	public constructor(client: Skyra) {
		// @ts-ignore
		super(client, 'rawEvents', RawEvent);
	}

}
