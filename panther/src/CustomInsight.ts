import * as ReactDOM from 'react-dom';
import * as React from 'react';
import {IAnalyticalBackend} from '@gooddata/sdk-backend-spi';
import {LineChart, LoadingComponent} from '@gooddata/sdk-ui-all';
import {Adapter, render} from './Adapter';
import {getInsight} from './registry';

export const getCustomInsightComponent = (backend: IAnalyticalBackend, workspace: string) => {
	return class GDInsight extends Adapter {
		[render](insight: string) {
			getInsight(insight).then(({type: _type, props}) => {
				// Render locally defined insight
				// TODO we know the type is "line", cause I did not implement other types - for brevity
				ReactDOM.render(React.createElement(LineChart, {
					backend,
					workspace,
					...props,
				}), this);
			});

			// Show loading while waiting
			ReactDOM.render(React.createElement(LoadingComponent), this);
		}
	};
};
