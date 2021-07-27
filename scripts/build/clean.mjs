import { rm } from 'node:fs/promises';

const rootFolder = new URL('../../', import.meta.url);
const distFolder = new URL('dist/', rootFolder);
const generatedFolder = new URL('src/lib/grpc/generated/', rootFolder);

const options = { recursive: true, force: true };

await Promise.all([rm(distFolder, options), rm(generatedFolder, options)]);
