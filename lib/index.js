/**
 * hex-api-server
 *
 * @version v0.2.0
 * @link http://hexajans.com
 */
'use strict';

const express = require('express'),
      EventEmitter = require('events'),
      path = require('path'),
      fs = require('fs'),
      logger = require('morgan'),

// cookieParser = require('cookie-parser'),
bodyParser = require('body-parser'),
      methodOverride = require('method-override'),
      i18n = require('i18n'),
      deepmerge = require('deepmerge'),
      router = require('./router.js'),
      protocolException = require('./exceptions/protocolException.js');

class apiServer {
    constructor() {
        this.events = new EventEmitter();
        this.routers = {};

        this.protocolException = protocolException;
    }

    init(options) {
        this.options = options;

        this.initHooks();
        this.initApp();
        this.events.emit('init');

        if (this.options.autoload !== false) {
            this.load();
        }

        return this.app;
    }

    load() {
        this.loadConfig();
        this.events.emit('loadConfig');

        this.loadFilters();
        this.events.emit('loadFilters');

        this.loadFrontControllers();
        this.events.emit('loadFrontController');
    }

    initHooks() {
        const self = this,
              gracefulExit = function gracefulExit() {
            console.log('Graceful exit initiated.');
            try {
                self.events.emit('terminate');
                process.exit(0);
            } catch (ex) {
                console.error(ex);
            }
        };

        process.on('SIGINT', gracefulExit).on('SIGTERM', gracefulExit);

        process.on('uncaughtException', function (ex) {
            console.log('# Uncaught Exception');
            // if (ex.constructor === protocolException) {
            // }
            console.error(ex);
            console.log(ex.stack);
        });

        process.on('unhandledRejection', function (reason, promise) {
            console.log('# Uncaught Rejection');
            console.error(reason);
        });
    }

    initApp() {
        this.app = express();
        this.env = this.app.get('env');

        this.app.set('json spaces', 4);
        this.app.set('x-powered-by', false);

        // localization
        i18n.configure({
            locales: this.options.i18n.locales,
            defaultLocale: this.options.i18n.defaultLocale,

            directory: `${ this.options.dir }/etc/locales`,
            autoReload: false,
            updateFiles: false,
            syncFiles: false
        });

        this.app.use(i18n.init);

        // request parsing
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: true }));
        // this.app.use(cookieParser());
        this.app.use(methodOverride());

        // logger
        this.app.use(logger('combined'));
    }

    loadConfig() {
        const normalizedCommonPath = 'etc/config/common',
              normalizedEnvPath = `etc/config/${ this.env }`;

        this.config = {};

        this.readDir([normalizedCommonPath, normalizedEnvPath], (file, dir) => {
            this.config = deepmerge(this.config, require(`${ dir }/${ file }`));
        });
    }

    loadFilters() {
        this.filters = {};

        this.readDir('src/routing/filters', (file, dir) => {
            const stat = fs.statSync(`${ dir }/${ file }`);

            if (stat.isFile()) {
                const basename = path.basename(file, '.js');

                this.filters[basename] = require(`${ dir }/${ file }`);
            }
        });
    }

    loadFrontControllers() {
        this.frontControllers = {};

        this.readDir('src/routing/frontControllers', (file, dir) => {
            const stat = fs.statSync(dir + '/' + file);

            if (stat.isFile()) {
                const basename = path.basename(file, '.js');

                this.frontControllers[basename] = require(`${ dir }/${ file }`);
            }
        });
    }

    addRouter(route, callback) {
        const routerInstance = new router(route, this);

        this.routers[route] = routerInstance;

        callback(routerInstance, this);
        routerInstance.finalize();
    }

    readDir(relativePaths, callback) {
        const relativePathsConverted = relativePaths.constructor === Array ? relativePaths : [relativePaths];

        for (let relativePath of relativePathsConverted) {
            const dir = path.join(this.options.dir, relativePath),
                  files = fs.readdirSync(dir);

            for (let file of files) {
                callback(file, dir);
            }
        }
    }
}

module.exports = new apiServer();