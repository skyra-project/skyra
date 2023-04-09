// Config must be the first to be loaded, as it sets the env:
import 'reflect-metadata';
import '#root/config';

// Import everything else:
import '#utils/Sanitizer/initClean';
import '@sapphire/plugin-api/register';
import '@sapphire/plugin-i18next/register';
import '@sapphire/plugin-logger/register';
import '@sapphire/plugin-editable-commands/register';

// Setup files
import '#lib/setup/canvas';
import '#lib/setup/inspect';
import '#lib/setup/paginated-message';
import '#lib/setup/prisma';
