import { createClient, loadAll } from '#lib/Client';
import { envParseString, setup } from '@skyra/env-utilities';
import { createBanner } from '@skyra/start-banner';
import { bold } from 'colorette';
import gradient from 'gradient-string';
import { container } from 'skyra-shared';

setup(new URL('../src/.env', import.meta.url));

createClient();
await loadAll();

console.log(
	gradient.vice.multiline(
		createBanner({
			logo: [
				String.raw`          /          `,
				String.raw`       ${bold('/╬')}▓           `,
				String.raw`     ${bold('/▓▓')}╢            `,
				String.raw`   [${bold('▓▓')}▓╣/            `,
				String.raw`   [╢╢╣▓             `,
				String.raw`    %,╚╣╣@\          `,
				String.raw`      #,╙▓▓▓\╙N      `,
				String.raw`       '╙ \▓▓▓╖╙╦    `,
				String.raw`            \@╣▓╗╢%  `,
				String.raw`               ▓╣╢╢] `,
				String.raw`              /╣▓${bold('▓▓')}] `,
				String.raw`              ╢${bold('▓▓/')}   `,
				String.raw`             ▓${bold('╬/')}     `,
				String.raw`            /        `
			],
			name: [
				String.raw`  ________  __   ___  ___  ___  _______        __ `,
				String.raw` /"       )|/"| /  ")|"  \/"  |/"      \      /""\ `,
				String.raw`(:   \___/ (: |/   /  \   \  /|:        |    /    \ `,
				String.raw` \___  \   |    __/    \\  \/ |_____/   )   /' /\  \ `,
				String.raw`  __/  \\  (// _  \    /   /   //      /   //  __'  \ `,
				String.raw` /" \   :) |: | \  \  /   /   |:  __   \  /   /  \\  \ `,
				String.raw`(_______/  (__|  \__)|___/    |__|  \___)(___/    \___) `
			],
			extra: [
				` Skyra ${envParseString('CLIENT_VERSION')} Gateway`,
				...container.stores.map((store) => `├─ Loaded ${store.size.toString().padEnd(3, ' ')} ${store.name}.`),
				` └ Redis    : ${container.redis.options.host}:${container.redis.options.port}`
			]
		})
	)
);
console.log('Ready');
