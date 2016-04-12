'use strict';

let config = new sey.config({
    global: {
        clean: {
            before: ['./lib/*']
        }
    },

    common: {
        babel: {
        },

        eslint: {
        },

        less: {
        },

        eser: true
    },

    main: {
        target: 'node',
        standard: 2016,

        banner: [
            '/**',
            ' * hex-api-server',
            ' *',
            ' * @version v0.2.0',
            ' * @link http://hexajans.com',
            ' */',
            ''
        ].join('\n'),

        preprocessVars: {
            BUNDLE: 'main'
        },

        ops: [
            {
                src: ['./src/**/*.js', './src/**/*.ts'],
                dest: './lib/',

                addheader: true,
                eolfix: true,
                lint: true,
                optimize: true,
                preprocess: true,
                transpile: true,
                typescript: true
            },
            {
                src: './test/*.js',
                test: true
            }
        ]
    }
});

sey.run(config);
