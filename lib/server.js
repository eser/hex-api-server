/**
 * hex-api-server
 *
 * @version v0.3.9
 * @link http://eser.ozvataf.com
 */
'use strict';

const debug = require('debug');

function normalizePort(val) {
    if (val === undefined) {
        return false;
    }

    const port = parseInt(val, 10);

    // named pipe
    if (isNaN(port)) {
        return val;
    }

    // port number
    if (port >= 0) {
        return port;
    }

    return false;
}

module.exports = function (app, options) {
    const options_ = options || {},
          port = normalizePort(options_.port) || normalizePort(process.env.PORT) || 3000,
          bind = typeof port === 'string' ? `Pipe ${ port }` : `Port ${ port }`;

    app.set('port', port);

    const debugServer = debug('hex-api-server');

    // nested functions
    function onError(error) {
        if (error.syscall !== 'listen') {
            throw error;
        }

        // handle specific listen errors with friendly messages
        switch (error.code) {
            case 'EACCES':
                console.error(`${ bind } requires elevated privileges`);
                process.exit(1);
                break;
            case 'EADDRINUSE':
                console.error(`${ bind } is already in use`);
                process.exit(1);
                break;
            default:
                throw error;
        }
    }

    function onListening() {
        debugServer(`Listening on ${ bind }...`);
    }

    let server;

    if (options_.http2 === true) {
        const spdy = require('spdy');

        server = spdy.createServer(options_.server, app).listen(port, error => {
            if (error) {
                onError(error);
            } else {
                onListening();
            }
        });
    } else {
        const http = require('http');

        server = http.createServer(app);
        server.listen(port);
        server.on('error', onError);
        server.on('listening', onListening);
    }

    return server;
};