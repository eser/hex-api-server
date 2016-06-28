const debug = require('debug'),
    http = require('http');

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

module.exports = function (app) {
    const port = normalizePort(process.env.PORT) || 3000,
        bind = (typeof port === 'string') ? `Pipe ${port}` : `Port ${port}`;

    app.set('port', port);

    const debugServer = debug('hex-api-server');

    const server = http.createServer(app);

    server.listen(port);

    server.on('error', (error) => {
        if (error.syscall !== 'listen') {
            throw error;
        }

        // handle specific listen errors with friendly messages
        switch (error.code) {
        case 'EACCES':
            console.error(`${bind} requires elevated privileges`);
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(`${bind} is already in use`);
            process.exit(1);
            break;
        default:
            throw error;
        }
    });

    server.on('listening', () => {
        debugServer(`Listening on ${bind}...`);
    });
};
