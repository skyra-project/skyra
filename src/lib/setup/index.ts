// Config must be the first to be loaded, as it sets the env:
import '#root/config';
import 'reflect-metadata';

// Import everything else:
import '#lib/setup/PaginatedMessage';
import '#utils/Sanitizer/initClean';
import '@sapphire/plugin-api/register';
import '@sapphire/plugin-editable-commands/register';
import '@sapphire/plugin-i18next/register';
import '@sapphire/plugin-logger/register';

import * as colorette from 'colorette';
import { inspect } from 'node:util';

inspect.defaultOptions.depth = 1;
colorette.createColors({ useColor: true });
