// TODO: Remove when @types/node ships those (alongside 3 more methods):

declare module 'stream/consumers' {
	export function buffer(stream: NodeJS.ReadableStream): Buffer;
	export function text(stream: NodeJS.ReadableStream): string;
}
