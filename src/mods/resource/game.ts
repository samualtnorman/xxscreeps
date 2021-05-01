import * as C from 'xxscreeps/game/constants';
import * as Container from './container';
import * as Resource from './resource';
import { registerGlobal } from 'xxscreeps/game';
import { LookFor, registerFindHandlers, registerLook } from 'xxscreeps/game/room';
import { registerSchema } from 'xxscreeps/engine/schema';

// Export `StructureContainer` & `Resource` to runtime globals
registerGlobal(Container.StructureContainer);
registerGlobal(Resource.Resource);
declare module 'xxscreeps/game/runtime' {
	interface Global {
		Resource: typeof Resource.Resource;
		StructureContainer: typeof Container.StructureContainer;
	}
}

// Register FIND_ types for `Resource`
const find = registerFindHandlers({
	[C.FIND_DROPPED_RESOURCES]: room => room[LookFor](C.LOOK_RESOURCES),
});

// Register LOOK_ type for `Resource`
const look = registerLook<Resource.Resource>()(C.LOOK_RESOURCES);
declare module 'xxscreeps/game/room' {
	interface Find { resource: typeof find }
	interface Look { resource: typeof look }
}

// These need to be declared separately I guess
const schema = registerSchema('Room.objects', Container.format);
const schema2 = registerSchema('Room.objects', Resource.format);

declare module 'xxscreeps/engine/schema' {
	interface Schema {
		resource: [ typeof schema, typeof schema2 ];
	}
}
