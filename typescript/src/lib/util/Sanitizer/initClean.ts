import { isNullishOrEmpty } from '#utils/comparators';
import { initClean } from '#utils/Sanitizer/clean';

const secrets = new Set<string>();
for (const [key, value] of Object.entries(process.env)) {
	if (isNullishOrEmpty(value)) continue;

	// _TOKEN keys
	if (key.endsWith('_TOKEN')) secrets.add(value);
	else if (key.endsWith('_SECRET')) secrets.add(value);
	else if (key.endsWith('_PASSWORD')) secrets.add(value);
}

initClean([...secrets]);
