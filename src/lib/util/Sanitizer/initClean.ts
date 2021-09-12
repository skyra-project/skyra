import { initClean } from '#utils/Sanitizer/clean';
import { isNullishOrEmpty } from '@sapphire/utilities';

const secrets = new Set<string>();
const suffixes = ['_KEY', '_TOKEN', '_SECRET', '_PASSWORD'];
for (const [key, value] of Object.entries(process.env)) {
	if (isNullishOrEmpty(value)) continue;
	if (suffixes.some((suffix) => key.endsWith(suffix))) secrets.add(value);
}

initClean([...secrets]);
