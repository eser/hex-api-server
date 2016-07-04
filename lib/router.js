/**
 * hex-api-server
 *
 * @version v0.3.9
 * @link http://eser.ozvataf.com
 */
'use strict';

const express = require('express');

class router {
    constructor(route, apiServer) {
        this.route = route;
        this.apiServer = apiServer;

        this.catchAll = this.defaultCatchAll;
        this.error = this.defaultError;

        this.expressRouter = express.Router();
    }

    add(callback) {
        callback(this.expressRouter, this.apiServer.frontControllers, this.apiServer.filters);
    }

    addCors() {
        // access control origins
        this.expressRouter.use((req, res, next) => {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type,Authorization');
            next();
        });
    }

    addStatic(publicPath) {
        this.expressRouter.use(express.static(publicPath));
    }

    addMiddleware(route, middleware) {
        this.expressRouter.use(route, middleware);
    }

    defaultCatchAll(req, res) {
        res.status(404).json({
            error: 'Not Found'
        });
    }

    defaultError(err, req, res, next) {
        const errorNode = {
            'message': err.message
        };

        errorNode.stackTrace = err.stack;

        if (err.exception) {
            errorNode.innerException = {
                'message': err.exception.message,
                'stackTrace': err.exception.stack
            };
        }

        res.status(err.status || 500);
        res.json({
            'error': errorNode
        });
    }

    finalize() {
        this.expressRouter.all('*', this.catchAll);
        this.expressRouter.use(this.error);

        this.apiServer.app.use(this.route, this.expressRouter);
    }
}

module.exports = router;