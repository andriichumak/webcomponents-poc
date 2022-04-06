# Web Components PoC

This PoC is meant to test out a few ideas:

1. Usage of JS "modules".
2. Usage of WebComponents as a way to isolate React runtime.
3. Reduce [the number of steps](https://sdk.gooddata.com/gooddata-ui/docs/platform_integration.html) for initial app setup.

The code quality is PoC-level.

## How to run

In [`panther`](./panther) folder I have a proxy to emulate the actual Panther server instance + some additional JS
files needed for PoC.

1. Navigate to the folder `cd panther`
2. Install dependencies `npm ci`
3. Build extra files `npm run build`
4. Open [package.json](./panther/package.json) file and edit line 7 - insert the Tiger/Panther host you're going to use, without protocol. E.g. my-tiger.server.com
5. Start proxy server `npm start`

The proxy server will run at http://127.0.0.1:8080. Make sure the port is free before starting the server.

In [`client-app`](./client-app) folder I have a static client with a few HTML files as examples. Simple HTTP server is
included, to start it up, run:

1. Navigate to the folder `cd client-app`.
2. Install dependencies `npm ci`.
3. Start HTTP server `npm start`.

Server will run on http://127.0.0.1:8081.  Make sure the port is free before starting the server. Open the URL in your browser.

To see the actual visualizations working, you'll need to open each HTML file and fill in variables:

1. `<tiger-token>`
2. `<workspace-id>`
3. `<dashboard-id>`
4. `<insight-id>`
5. In [`custom-insight.html`](./client-app/custom-insight.html) you'll also need to fill in metrics and attributes for the custom line chart.

## Conclusions

### Usage of JS modules

We could use the technology, but it would need investment and the benefits are not that big.

* (+) All browsers we support already support JS modules.
* (+) It's a new fresh and cool technology, we might get some points from devs for using it.
* (-) It's a new fresh and cool technology, adoption is not there yet, juniors or "old schoolers" might not like it.
* (-) We would need to switch Panther to HTTP2 protocol to make it efficient to load scripts. Although, we would have to switch some day anyway, and it would bring slight performance benefits regardless of JS modules.

For the sake of this PoC, modules are good because they allow importing scripts from foreign server without polluting
global scope. + you can import GD.UI objects in browser without the need to bake our library into your own code.
This was done in an attempt to simplify the setup (described below).

In scope of this PoC I did not do a proper module splitting, so it's one 15MB file. In production, we would use the
full power of modules to load only what's needed.

### Usage of WebComponents

Overall, the experiment is a success. As you can see in `dashboard.html` and `insight.html`, the client side code is very
simple, can actually compete with iframe embedding.

This would also work very well when integrating with apps written in other frameworks, like Angular or Vue. No need for
cumbersome adapters, just inject the script and use custom HTML elements in your Angular/Vue code.

I was unable to test Shadow DOM due to the way GD.UI is built. If we decide to productize it,
we'll need to do minor changes in GD.UI.

Shadow DOM would bring a few nice additions to the setup:

1. Styles isolation. The DOM under shadow root has its own CSS context, meaning the styles will not "spill over" to the host application.
2. Closed Shadow DOM would allow us to hide implementation details from client developer. Similar how you can't see inside the `video` element with dev tools (Video is actually implemented as WebComponent in some browsers, at least it used to be).

I also did not test eventing and imperative API of the WebComponent. We should be able to expose some functions to user and dispatch some evens, like so:

```javascript
const insight = document.getElementById('myInsight');

// Listed to custom events
insight.addEventListener('load', () => console.log('Insight loaded!'));
// Trigger an action with imperative API
insight.reload();
```

In `custom-insight.html`, I demonstrated that you can even build a dynamic insight with custom elements, although I have
to admit that the setup is somewhat cumbersome, as custom elements do not provide an API to pass anything other than strings.

We could somewhat improve it for Angular or Vue usage, e.g.:

```
// In Angular component
const insight: string = registerInsight('line', {measures: [], attributes: []});
<custom-insight [config]="insight"></custom-insight>
```

Given we do a proper module splitting and load the minimum necessary files, we could even work around React incompatibility
issues with this. E.g. If customer is using React 18 (we don't support it yet), they would still be able to use this lib,
as React instance is isolated. Of course, this is not a recommended way, and typically we would expect customers to use GD.UI directly.

Going further, this could be a starting point for Pluggable Visualisation, if we want to approach this from the other side.
I.e. we could gradually get rid of Highcharts and React dependencies (chart by chart) for this library. Build a strong
public API (including imperative and custom events) and switch to it eventually. GD.UI would than be a thin React wrapper
around these new modules. There are a lot of unknowns here and there are no clear "enablers" that would make
Pluggable Visualizations better this way, so I'm not suggesting it just yet, but I believe it's worth investigating.

### Simplify the setup

In [our docs](https://sdk.gooddata.com/gooddata-ui/docs/platform_integration.html) we have 5 steps for the initial setup:

1. **Install the necessary dependencies** - not needed, we just import script from Panther server.
2. **Include styles** - not needed, styles are injected automatically (ideally, only to the Shadow DOM context).
3. **Set up Analytical Backend and integrate it into your application** - not needed, see below.
4. **Solve Cross-Origin Resource Sharing** - still have to configure it.
5. **Configure authentication** - simplified for development, but still necessary for production.

Typically, you would need to find your Panther host name and workspace id and use it with the React's Provider in your app.
This is especially cumbersome if your host app is not written in React.

With WebComponents, this information is a part of the script URL. There are some edge cases, like when you want to embed
insights or dashboards from different workspaces on the same page, but that should not happen too often, and it can be easily
worked around by handling additional optional custom element attribute.

Dev token in the script URL is a controversial idea. On the one hand it speeds up the dev setup (especially if token
can be generated when developer is copying the code),
on the other hand it's very easy to abuse it and leave dev token in production, thus creating a security hole.
This idea should be discussed with SecOps.
