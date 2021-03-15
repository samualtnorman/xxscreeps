import type { Game } from '.';
import type { Room } from './room';
import type { LookConstants } from './room/look';
import * as Id from 'xxscreeps/engine/schema/id';
import * as RoomPosition from 'xxscreeps/game/position';
import { compose, declare, optional, struct, vector, withOverlay } from 'xxscreeps/schema';
import { BufferObject } from 'xxscreeps/schema/buffer-object';
import { expandGetters } from 'xxscreeps/engine/util/inspect';
import { IntentIdentifier } from 'xxscreeps/processor/symbols';
import { assign } from 'xxscreeps/utility/utility';

export const AddToMyGame = Symbol('addToMyGame');
export const AfterInsert = Symbol('afterInsert');
export const AfterRemove = Symbol('afterRemove');
export const LookType = Symbol('lookType');
export const NextPosition = Symbol('nextPosition');
export const Owner = Symbol('owner');
export const PathCost = Symbol('pathCost');

export const format = () => compose(shape, RoomObject);
const shape = declare('RoomObject', struct({
	id: Id.format,
	pos: RoomPosition.format,
	effects: optional(vector(struct({
		effect: 'uint16',
		expireTime: 'uint32',
		level: 'uint16',
	}))),
}));

export type RoomObjectWithOwner = { [Owner]: string } & RoomObject;

export abstract class RoomObject extends withOverlay(BufferObject, shape) {
	abstract get [LookType](): LookConstants;
	room!: Room;
	[NextPosition]?: RoomPosition.RoomPosition | null;

	[AddToMyGame](_game: Game) {}
	[AfterInsert](room: Room) {
		this.room = room;
	}
	[AfterRemove](_room: Room) {
		this.room = undefined as never;
	}

	[Symbol.for('nodejs.util.inspect.custom')]() {
		return expandGetters(this);
	}

	get [IntentIdentifier]() {
		return { group: this.room.name, name: this.id };
	}

	get [PathCost](): undefined | number {
		return undefined;
	}
}

export function create<Type extends RoomObject>(instance: Type, pos: RoomPosition.RoomPosition): Type {
	return assign<Type, RoomObject>(instance, {
		id: Id.generateId(),
		pos,
	});
}