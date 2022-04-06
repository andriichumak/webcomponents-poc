// Import styles
import '@gooddata/sdk-ui-filters/styles/css/main.css';
import '@gooddata/sdk-ui-charts/styles/css/main.css';
import '@gooddata/sdk-ui-geo/styles/css/main.css';
import '@gooddata/sdk-ui-pivot/styles/css/main.css';
import '@gooddata/sdk-ui-kit/styles/css/main.css';
import '@gooddata/sdk-ui-ext/styles/css/main.css';
import '@gooddata/sdk-ui-dashboard/styles/css/main.css';

import tigerFactory, {redirectToTigerAuthentication, TigerTokenAuthProvider} from '@gooddata/sdk-backend-tiger';

// Import web components
import {getDashboardComponent} from './Dashboard';
import {getInsightComponent} from './Insight';
import {getCustomInsightComponent} from './CustomInsight';
import {ContextDeferredAuthProvider} from '@gooddata/sdk-backend-tiger/esm/auth';

export {registerInsight} from './registry';
export {newMeasure, newAttribute, idRef} from '@gooddata/sdk-model';

// Parse the current script URL to get config out of it
const url = new URL(import.meta.url);
// TODO handle the case when workspace is not provided in the URL
const workspaceId = url.pathname.match(/^\/components\/([^.]+)\.js/i)?.[1] ?? '';
const token = url.searchParams.get('devToken');

// Create a backend
let backend;
if (token) {
	// TODO - this is probably not the best approach from security perspective, event with the warning.
	//  Should consider enforcing it somehow.
	console.warn('The token provided in the script URL is not the best practice for production environment and should only be used during development.');
	backend = tigerFactory()
		.onHostname(`${url.protocol}//${url.host}`)
		.withAuthentication(new TigerTokenAuthProvider(token))
} else {
	// TODO - this path does not work, needs some changes in server.js proxy to allow logging in using proxified
	//  Panther page
	backend = tigerFactory()
		.onHostname(`${url.protocol}//${url.host}`)
		.withAuthentication(new ContextDeferredAuthProvider(redirectToTigerAuthentication));
}

// Register web components
customElements.define('gd-dashboard', getDashboardComponent(backend, workspaceId));
customElements.define('gd-insight', getInsightComponent(backend, workspaceId));
customElements.define('gd-custom-insight', getCustomInsightComponent(backend, workspaceId));
