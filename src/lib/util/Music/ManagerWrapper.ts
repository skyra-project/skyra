/**
 *   Copyright 2019-2020 Jacz
 *
 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */

import type { SkyraClient } from '@lib/SkyraClient';
import { Manager as LavacordManager, LavalinkNodeOptions, ManagerOptions } from 'lavacord';

export class Manager extends LavacordManager {
	public constructor(public readonly client: SkyraClient, nodes: LavalinkNodeOptions[], options?: ManagerOptions) {
		super(nodes, options || {});
		this.client = client;

		this.send = (packet) => {
			const guild = this.client.guilds.get(packet.d.guild_id);
			if (guild) return guild.shard.send(packet);
		};

		client.once('ready', () => {
			this.user = client.user!.id;
			this.shards = client.options.shardCount || 1;
		});
	}
}
