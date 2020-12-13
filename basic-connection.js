const http = require('http');

const port = 3000;
const host = '127.0.0.1';

const server = http.createServer((req, res) => {
	if (req.method === 'POST') {
		res.writeHead(200, { 'Content-Type': 'text/html' });

		let body = '';
		req.on('data', data => {
			body += data;
		});
		req.on('end', () => {
			console.log(body);
			res.end('');
		});
	} else {
		console.log('Not expecting other request types...');
		res.writeHead(200, { 'Content-Type': 'text/html' });
		const html = '<html><body>HTTP Server at http://' + host + ':' + port + '</body></html>';
		res.end(html);
	}
});

server.listen(port, host);
console.log('Listening at http://' + host + ':' + port);
