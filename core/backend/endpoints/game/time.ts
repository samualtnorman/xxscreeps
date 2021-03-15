import { Endpoint } from 'xxscreeps/backend/endpoint';
import config from 'xxscreeps/config';

const TickEndpoint: Endpoint = {
	path: '/tick',

	execute() {
		return {
			ok: 1,
			tick: config.game?.tickSpeed ?? 250,
		};
	},
};

const TimeEndpoint: Endpoint = {
	path: '/time',

	execute() {
		return {
			ok: 1,
			time: this.context.time,
		};
	},
};

export default [ TickEndpoint, TimeEndpoint ];