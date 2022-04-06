import * as ReactDOM from 'react-dom';

export const render = Symbol('render');

export class Adapter extends HTMLElement {
	static get observedAttributes() {
		return ['ref'];
	}

	attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
		// TODO auto-track other attributes, perhaps based on observableAttributes
		if (name === 'ref' && newValue && newValue !== oldValue) {
			console.log('Render due to attribute change');
			this[render](newValue);
		}
	}

	connectedCallback() {
		const ref = this.getAttribute('ref');

		if (!ref)
			return;

		console.log('Render due to connection callback');
		this[render](ref);
	}

	disconnectedCallback() {
		ReactDOM.unmountComponentAtNode(this);
	}
}
