// Registry is a primitive state machine / observable
import {ILineChartProps} from '@gooddata/sdk-ui-all';

type RegistryData = {
	type: string,
	props: ILineChartProps,
};

type RegistryItem = {
	promise: Promise<RegistryData>,
	resolve: (data: RegistryData) => void,
};

const insights = {};

// This is probably an anti-pattern for Promise,
// should use something like Observable instead, but it's good enough for PoC
const makeRegistryItem = () => {
	const item: RegistryItem = {} as RegistryItem;

	item.promise = new Promise(res => {
		item.resolve = res;
	});

	return item;
};

// TODO - "line" is hardcoded for brevity, should allow all insight types
export const registerInsight = (id: string, type: 'line', props: ILineChartProps) => {
	if (!insights[id]) {
		insights[id] = makeRegistryItem();
	}

	insights[id].resolve({type, props});
};

export const getInsight = (id: string): Promise<RegistryData> => {
	if (!insights[id]) {
		insights[id] = makeRegistryItem();
	}

	return insights[id].promise;
};
