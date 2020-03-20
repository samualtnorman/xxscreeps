/* eslint-disable @typescript-eslint/consistent-type-definitions */
export {}; // fake module
const BufferType: unique symbol = Symbol();

declare global {
	// Converts a type to a newable type
	type Constructor<Type> =
	Type extends new(...args: infer Params) => infer Instance ?
		new(...args: Params) => Instance :
		new(...args: any[]) => Type;

	// Same as `Record` but has nullable members
	type Dictionary<Type> = {
		[key in string]?: Type;
	};

	// Public Promise
	type Resolver<Type = unknown> = {
		resolve: (payload: Type) => void;
		reject: (payload: Error) => void;
	};

	// Make all array buffers strongly typed
	interface ArrayBuffer { [BufferType]?: 'arrayBuffer' }
	interface SharedArrayBuffer { [BufferType]?: 'sharedArrayBuffer' }
	interface Int8Array { [BufferType]?: 'int8' }
	interface Int16Array { [BufferType]?: 'int16' }
	interface Int32Array { [BufferType]?: 'int32' }
	interface Uint8Array { [BufferType]?: 'uint8' }
	interface Uint16Array { [BufferType]?: 'uint16' }
	interface Uint32Array { [BufferType]?: 'uint32' }
	interface Float32Array { [BufferType]?: 'float32' }
	interface Float64Array { [BufferType]?: 'float64' }
	interface BigInt64Array { [BufferType]?: 'bigInt32' }
	interface BigUint64Array { [BufferType]?: 'bigInt64' }
}
