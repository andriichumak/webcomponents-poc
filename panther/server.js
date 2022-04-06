const http = require('http');
const httpProxy = require('http-proxy');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT;
const TARGET_HOST = process.env.TARGET_HOST;

const proxy = httpProxy.createProxyServer({
	target: `https://${TARGET_HOST}`,
	changeOrigin: true,
	secure: false,
	cookieDomainRewrite: '127.0.0.1:8081',
	headers: {
		host: TARGET_HOST,
		'X-Requested-With': 'XMLHttpRequest',
	}
});

proxy.on('proxyReq', function(proxyReq, req, res, options) {
	proxyReq.removeHeader('origin');
	proxyReq.setHeader('accept-encoding', 'identity');
	enableCors(req, res);
});

const enableCors = (req, res) => {
	if (req.headers['access-control-request-method']) {
		res.setHeader('access-control-allow-methods', req.headers['access-control-request-method']);
	}

	if (req.headers['access-control-request-headers']) {
		res.setHeader('access-control-allow-headers', req.headers['access-control-request-headers']);
	}

	if (req.headers.origin) {
		res.setHeader('access-control-allow-origin', req.headers.origin);
		res.setHeader('access-control-allow-credentials', 'true');
	}
};

const mimeTypes = {
	'html': 'text/html',
	'jpeg': 'image/jpeg',
	'jpg': 'image/jpeg',
	'png': 'image/png',
	'svg': 'image/svg+xml',
	'json': 'application/json',
	'js': 'application/javascript',
	'mjs': 'application/javascript',
	'css': 'text/css',
};

const server = http.createServer((req, res) => {
	// If URL starts with /components/ - it has to be mapped to the local dist folder
	if (req.url.startsWith('/components')) {
		let output, filePath, mime;
		// First test for existing files
		try {
			filePath = path.resolve(__dirname, 'dist', req.url.replace('/components/', ''));
			// TODO readFileSync is for POC, should pass the file stream to the res instead
			output = fs.readFileSync(filePath);
			mime = mimeTypes[filePath.replace(/.+\.([^.]+)$/, '$1')] || 'application/octet-stream';
		} catch (e) {
			// No file with the given path, deliver the main js file
			// TODO check the error type to ensure it's really "file not found"
			filePath = path.resolve(__dirname, 'dist', 'main.mjs');
			output = fs.readFileSync(filePath);
			mime = mimeTypes.mjs;
		}

		res.writeHead(200, {
			'Content-Type': mime,
			'Content-Length': output.length, // TODO account for special chars when calc length
			'Access-Control-Allow-Origin': 'http://127.0.0.1:8081',
		});
		res.write(output);
		res.end();

		console.log(`${req.url}: ${filePath}`);

		return;
	}

	console.log(`PROXY: ${req.url}`);

	if (req.method === 'OPTIONS') {
		enableCors(req, res);
		res.writeHead(200);
		res.end();
		return;
	}

	proxy.web(req, res);
});

server.listen(PORT);

console.log(`Panther server is running on: http://127.0.0.1:${PORT}`);
