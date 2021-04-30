import { rm } from 'node:fs/promises';

const typescriptFolder = new URL('../../typescript/', import.meta.url);
const distFolder = new URL('dist/', typescriptFolder);
const generatedFolder = new URL('src/lib/grpc/generated/', typescriptFolder);

const options = { recursive: true, force: true };

await Promise.all([rm(distFolder, options), rm(generatedFolder, options)]);
