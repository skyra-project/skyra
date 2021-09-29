// Config must be the first to be loaded, as it sets the env:
import 'reflect-metadata';
import '#root/config';

// Import everything else:
import '#utils/Sanitizer/initClean';
import '@sapphire/plugin-api/register';
import '@sapphire/plugin-i18next/register';
import '@sapphire/plugin-logger/register';
import '@sapphire/plugin-editable-commands/register';
import './Canvas';
import './Grpc';

import * as colorette from 'colorette';
import { inspect } from 'util';

inspect.defaultOptions.depth = 1;
colorette.createColors({ useColor: true });
