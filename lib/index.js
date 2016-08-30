/**
 * hex-api-server
 *
 * @version v0.3.9
 * @link http://eser.ozvataf.com
 */
'use strict';

const express = require('express'),
      EventEmitter = require('events'),
      path = require('path'),
      fs = require('fs'),
      maester = require('maester'),
      logger = require('morgan'),

// cookieParser = require('cookie-parser'),
bodyParser = require('body-parser'),
      methodOverride = require('method-override'),
      i18n = require('i18n'),
      deepmerge = require('deepmerge'),
      router = require('./router.js');

class apiServer {
    constructor() {
        this.events = new EventEmitter();
        this.routers = {};

        this.protocolException = maester.exception;

        this.cmdMode = process.env.HEX_CMD === '1';
        this.register('apiServer', this);
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

        if (this.cmdMode) {
            this.loadControllers();
            this.events.emit('loadController');
        }
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
        this.app.use(bodyParser.json({ limit: '50mb' }));
        this.app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
        // this.app.use(cookieParser());
        this.app.use(methodOverride());

        // logger
        this.app.use(logger('combined'));
    }

    loadConfig() {
        const normalizedCommonPath = 'etc/config/common',
              normalizedEnvPath = `etc/config/${ this.env }`;

        this.config = {};

        this.readDir([normalizedCommonPath, normalizedEnvPath], f => {
            if (f.stat.isFile()) {
                const basename = path.basename(f.file, '.js');

                if (f.isDotFile) {
                    return;
                }

                this.config = deepmerge(this.config, require(f.filepath));
            }
        });
    }

    loadFilters() {
        this.filters = {};

        this.readDir('src/routing/filters', f => {
            if (f.stat.isFile()) {
                const basename = path.basename(f.file, '.js');

                if (f.isDotFile) {
                    return;
                }

                this.filters[basename] = require(f.filepath);
            }
        });
    }

    loadFrontControllers() {
        this.frontControllers = {};

        this.readDir('src/routing/frontControllers', f => {
            if (f.stat.isFile()) {
                const basename = path.basename(f.file, '.js');

                if (f.isDotFile) {
                    return;
                }

                this.frontControllers[basename] = require(f.filepath);
            }
        });
    }

    loadControllers() {
        this.controllers = {};

        this.readDir('src/controllers', (file, dir) => {
            if (f.stat.isFile()) {
                const basename = path.basename(f.file, '.js');

                if (f.isDotFile) {
                    return;
                }

                this.controllers[basename] = require(f.filepath);
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
            try {
                const dir = path.join(this.options.dir, relativePath),
                      files = fs.readdirSync(dir);

                for (let file of files) {
                    const filepath = `${ dir }/${ file }`;

                    callback({
                        dir: dir,
                        file: file,
                        filepath: filepath,
                        stat: fs.statSync(filepath),
                        isDotFile: file.substring(0, 1)
                    });
                }
            } catch (ex) {
                if (ex === undefined || ex === null || ex.code !== 'ENOENT') {
                    throw ex;
                }
            }
        }
    }

    register(name, variable) {
        if (this.cmdMode) {
            global[name] = variable;
        }
    }
}

module.exports = new apiServer();