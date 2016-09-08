# [hex-api-server](https://github.com/eserozvataf/hex-api-server)

This project is designed to serve as a backbone for node.js applications.

* Source: [https://github.com/eserozvataf/hex-api-server](https://github.com/eserozvataf/hex-api-server)
* Twitter: [@eserozvataf](http://twitter.com/eserozvataf)
* Homepage: [http://eser.ozvataf.com/](http://eser.ozvataf.com/)


## Quick start

Execute `npm install hex-api-server --save` to install hex-api-center and its dependencies into empty project directory.


## Directory Structure

| Directory                         | Description                                                                |
|-----------------------------------|----------------------------------------------------------------------------|
| `/bin/`                           | Executable binaries                                                        |
| `/build/`                         | Compiled output of project                                                 |
| `/etc/`                           | Configuration files                                                        |
| `/public/`                        | Public files for web site                                                  |
| `/src/`                           | Project source                                                             |
| `/src/controllers/`               | Controllers                                                                |
| `/src/data/`                      | Data Layer                                                                 |
| `/src/data/migrations/`           | Database migrations                                                        |
| `/src/data/objects/`              | Data objects, wrappers, etc.                                               |
| `/src/data/providers/`            | Provider classes for 3rd party service integrations                        |
| `/src/data/repositories/`         | Repository classes for gathering data from a datasource                    |
| `/src/data/schemas/`              | Data schemas                                                               |
| `/src/data/utils/`                | Utility classes for Data Layer components                                  |
| `/src/routing/`                   | Routing definitions                                                        |
| `/src/routing/filters/`           | Filters (e.g. mutates request to validate authentication)                  |
| `/src/routing/frontControllers/`  | Redirects requests to internal controllers of project                      |
| `/src/routing/middlewares/`       | Middlewares                                                                |
| `/src/utils`                      | Utility classes for entire project                                         |
| `/test/`                          | Project tests                                                              |


## Todo List

See [GitHub Issues](https://github.com/eserozvataf/hex-api-server/issues).


## Requirements

* node.js (https://nodejs.org/)


## License

GNU General Public License 3.0, for further details, please see [LICENSE](LICENSE) file


## Contributing

See [contributors.md](contributors.md)

It is publicly open for any contribution. Bugfixes, new features and extra modules are welcome.

* To contribute to code: Fork the repo, push your changes to your fork, and submit a pull request.
* To report a bug: If something does not work, please report it using GitHub issues.
* To support: [![Donate](https://img.shields.io/gratipay/eserozvataf.svg)](https://gratipay.com/eserozvataf/)
