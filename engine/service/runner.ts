import * as Code from '~/engine/metadata/code';
import * as User from '~/engine/metadata/user';
import { loadTerrainFromWorld, readWorld } from '~/game/map';
import { getReader } from '~/lib/schema/read';
import { loadTerrain } from '~/driver/path-finder';
import { createSandbox, Sandbox } from '~/driver/sandbox';
import { mapInPlace, filterInPlace } from '~/lib/utility';
import { BlobStorage } from '~/storage/blob';
import { Channel } from '~/storage/channel';
import { Queue } from '~/storage/queue';
import { RunnerMessage } from '.';

export default async function() {

	// Connect to main & storage
	const blobStorage = await BlobStorage.connect();
	const usersQueue = await Queue.connect('runnerUsers');
	const runnerChannel = await Channel.connect<RunnerMessage>('runner');

	// Load shared terrain data
	const terrainBuffer = await blobStorage.load('terrain');
	const world = readWorld(terrainBuffer);
	loadTerrain(world); // pathfinder
	loadTerrainFromWorld(world); // game

	// Initialize binary schemas
	const readCode = getReader(Code.format);

	// Start the runner loop
	let gameTime = -1;
	runnerChannel.publish({ type: 'runnerConnected' });
	try {
		const sandboxes = new Map<string, Sandbox>();
		for await (const message of runnerChannel) {

			if (message.type === 'shutdown') {
				break;

			} else if (message.type === 'processUsers') {
				gameTime = message.time;
				usersQueue.version(gameTime);
				for await (const userId of usersQueue) {
					const [ sandbox, { roomBlobs, visibleRooms } ] = await Promise.all([
						// Get user sandbox
						async function() {
							// Use cached sandbox
							const existing = sandboxes.get(userId);
							if (existing) {
								return existing;
							}
							// Generate a new one
							const userCode = readCode(await blobStorage.load(`code/${userId}`));
							const sandbox = await createSandbox(userId, userCode, terrainBuffer);
							sandboxes.set(userId, sandbox);
							return sandbox;
						}(),
						// Load visible rooms for this user
						async function() {
							const userInfo = User.read(await blobStorage.load(`user/${userId}`));
							const { visibleRooms } = userInfo;
							const roomBlobs = await Promise.all(mapInPlace(visibleRooms, roomName =>
								blobStorage.load(`ticks/${gameTime}/${roomName}`),
							));
							return { roomBlobs, visibleRooms };
						}(),
					]);

					// Run user code
					const result = await sandbox.run(gameTime, roomBlobs);

					// Save intent blobs
					const savedRoomNames = mapInPlace(Object.entries(result.intents), async([ roomName, intents ]) => {
						if (visibleRooms.has(roomName)) {
							await blobStorage.save(`intents/${roomName}/${userId}`, new Uint8Array(intents!));
							return roomName;
						} else {
							console.error(`Runtime sent intent for non-visible room. User: ${userId}; Room: ${roomName}; Tick: ${gameTime}`);
						}
					});
					const roomNames = [ ...filterInPlace(await Promise.all(savedRoomNames),
						(roomName): roomName is string => roomName !== undefined) ];
					runnerChannel.publish({ type: 'processedUser', userId, roomNames });
				}
			}
		}

	} finally {
		blobStorage.disconnect();
		usersQueue.disconnect();
		runnerChannel.disconnect();
	}
}
