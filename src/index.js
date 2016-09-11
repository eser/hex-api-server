const express = require('express'),
    EventEmitter = require('events'),
    path = require('path'),
    fs = require('fs'),
    cofounder = require('cofounder'),
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

        this.cmdMode = (process.env.HEX_CMD === '1');
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
            gracefulExit = function () {
                console.log('Graceful exit initiated.');
                try {
                    self.events.emit('terminate');
                    process.exit(0);
                }
                catch (ex) {
                    console.error(ex);
                }
            };

        process.on('SIGINT', gracefulExit)
               .on('SIGTERM', gracefulExit);

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

            directory: `${this.options.dir}/etc/locales`,
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
        const normalizedCommonPath = `${this.options.dir}/etc/config/common`,
            normalizedEnvPath = `${this.options.dir}/etc/config/${this.env}`;

        this.config = {};

        cofounder.scanDir(
            [ normalizedCommonPath, normalizedEnvPath ],
            (f) => {
                if (f.stat.isFile() && !f.isDotFile && f.extname === '.js') {
                    this.config = deepmerge(this.config, require(f.filepath));
                }
            }
        );
    }

    loadFilters() {
        this.filters = this.scanModules(`${this.options.dir}/src/routing/filters`);
    }

    loadFrontControllers() {
        this.frontControllers = this.scanModules(`${this.options.dir}/src/routing/frontControllers`);
    }

    loadControllers() {
        this.controllers = this.scanModules(`${this.options.dir}/src/controllers`);
    }

    addRouter(route, callback) {
        const routerInstance = new router(route, this);

        this.routers[route] = routerInstance;

        callback(routerInstance, this);
        routerInstance.finalize();
    }

    scanModules(relativePaths) {
        const loadedModules = {};

        cofounder.scanDir(
            relativePaths,
            (f) => {
                if (f.stat.isFile() && !f.isDotFile && f.extname === '.js') {
                    loadedModules[f.basename] = require(f.filepath);
                }
            }
        );

        return loadedModules;
    }

    register(name, variable) {
        if (this.cmdMode) {
            global[name] = variable;
        }
    }
}

module.exports = new apiServer();
