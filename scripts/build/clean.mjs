import { rm } from 'node:fs/promises';

const rootFolder = new URL('../../', import.meta.url);
const distFolder = new URL('dist/', rootFolder);

const options = { recursive: true, force: true };

await rm(distFolder, options);
