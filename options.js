const utils = require("./modules/utils")();
const processes = require("./modules/processes")();

// This object stores the properties of all options available for passing in arguments
// And a custom function key (callBackFn) which will be executed when that option is passed
const options = {
    l: {
        // Yargs option property mapping
        alias: 'list',
        describe: 'Shows the list of hosts in tabular format',
        boolean: true,
        // Custom key to set function which will get executed when this option is passed as argument
        callBackFn: processes.list
    },
    v: {
        // Yargs option property mapping
        alias: 'version'
    },
    h: {
        // Yargs option property mapping
        alias: 'help'
    },
    b: {
        // Yargs option property mapping
        alias: 'backup',
        describe: 'Backups the current hosts file to ' + utils.getBackupFilePath(true),
        boolean: true,
        // Custom key to set function which will get executed when this option is passed as argument
        callBackFn: processes.backup
    },
    a: {
        alias: 'activate',
        describe: 'Activate a line number or group number. Requires line number (-n | --line-number) or group (-g | --group)',
        depends: {
            options: ['n', 'g'],
            describe: 'Requires line number (-n | --line-number) or group (-g | --group)',
            preferred: true
        },
        callBackFn: processes.activate
    },
    d: {
        alias: 'de-activate',
        describe: 'De-activate a line number or group number. Requires line number (-n | --line-number) or group (-g | --group)',
        depends: {
            options: ['n', 'g'],
            describe: 'Requires line number (-n | --line-number) or group (-g | --group)',
            preferred: true
        },
        callBackFn: processes.deActivate
    },
    n: {
        alias: 'line-number',
        requiresArg: true,
        conflicts: 'g',
        depends: {
            options: ['a', 'd'],
            describe: 'Requires activate option (-a | --activate) or de-activate option (-d | --de-activate)'
        },
        type: 'number',
        describe: 'The line number to be activated or de-activated. Requires activate option (-a | --activate) or de-activate option (-d | --de-activate)'
    },
    g: {
        alias: 'group',
        requiresArg: true,
        depends: {
            options: ['a', 'd'],
            describe: 'Requires activate option (-a | --activate) or de-activate option (-d | --de-activate)'
        },
        type: 'number',
        describe: 'The group number to be activated or de-activated. Requires activate option (-a | --activate) or de-activate option (-d | --de-activate)'
    }
};

module.exports = options;