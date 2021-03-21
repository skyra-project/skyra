// Config must be the first to be loaded, as it sets the env:
import '#root/config';

// Import everything else:
import '#utils/Sanitizer/initClean';
import '@sapphire/plugin-api/register';
import '@sapphire/plugin-i18next/register-discordjs';
import '@sapphire/plugin-logger/register';
import 'reflect-metadata';
import './Canvas';

import * as colorette from 'colorette';
import { inspect } from 'util';

inspect.defaultOptions.depth = 1;
colorette.options.enabled = true;
