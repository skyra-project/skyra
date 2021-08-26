// TODO: Remove when @types/node ships those (alongside 3 more methods):
// https://github.com/DefinitelyTyped/DefinitelyTyped/pull/55311

declare module 'stream/consumers' {
	export function buffer(stream: NodeJS.ReadableStream): Buffer;
	export function text(stream: NodeJS.ReadableStream): string;
}
