const helper = require("./helper");
const processes = require("./processes");

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
        describe: 'Backups the current hosts file to ' + helper.getBackupFilePath(true),
        boolean: true,
        // Custom key to set function which will get executed when this option is passed as argument
        callBackFn: processes.backup
    }
};

module.exports = options;