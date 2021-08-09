// Config must be the first to be loaded, as it sets the env:
import 'reflect-metadata';
import sourceMapSupport from 'source-map-support';

if (process.env.NODE_ENV !== 'test') {
	sourceMapSupport.install();
}

import '#root/config';

// Import everything else:
import '#utils/Sanitizer/initClean';
import '@sapphire/plugin-api/register';
import '@sapphire/plugin-i18next/register';
import '@sapphire/plugin-logger/register';
import './Canvas';
import './Grpc';

import * as colorette from 'colorette';
import { inspect } from 'util';

inspect.defaultOptions.depth = 1;
colorette.options.enabled = true;
