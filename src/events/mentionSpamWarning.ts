// Copyright (c) 2018 BDISTIN. All rights reserved. MIT license.
import { Event, KlasaMessage } from 'klasa';

export default class extends Event {

	public async run(message: KlasaMessage): Promise<void> {
		await message.alert(message.language.get('MONITOR_NMS_ALERT'));
	}

}
