import * as ReactDOM from 'react-dom';
import * as React from 'react';
import {IAnalyticalBackend} from '@gooddata/sdk-backend-spi';
import {InsightView} from '@gooddata/sdk-ui-all';
import {Adapter, render} from './Adapter';

export const getInsightComponent = (backend: IAnalyticalBackend, workspace: string) => {
	return class GDInsight extends Adapter {
		[render](insight: string) {
			// Render InsightView
			ReactDOM.render(React.createElement(InsightView, {
				backend,
				workspace,
				insight,
			}), this);
		}
	};
};
