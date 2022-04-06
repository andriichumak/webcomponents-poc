import * as ReactDOM from 'react-dom';
import * as React from 'react';
import {IAnalyticalBackend} from '@gooddata/sdk-backend-spi';
import {Dashboard} from '@gooddata/sdk-ui-dashboard';
import {Adapter, render} from './Adapter';

export const getDashboardComponent = (backend: IAnalyticalBackend, workspace: string) => {
	return class GDDashboard extends Adapter {
		[render](dashboard: string) {
			ReactDOM.render(React.createElement(Dashboard, {
				backend,
				workspace,
				dashboard,
			}), this);
		}
	};
};
