import '#utils/Sanitizer/initClean';
import '@sapphire/plugin-api/register';
import '@sapphire/plugin-i18next/register-discordjs';
import '@sapphire/plugin-logger/register';
import 'reflect-metadata';
import './Canvas';

import { DEV } from '#root/config';
import * as colorette from 'colorette';
import { inspect } from 'util';

inspect.defaultOptions.depth = 1;
colorette.options.enabled = true;
process.env.NODE_ENV ??= DEV ? 'development' : 'production';
