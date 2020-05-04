const utils = require("./utils");
const fs = require('fs');
/**
 * This file exports all available processing that can be done on the hosts file
 */

module.exports = processes;
function processes() {
    var self = {};

    const utility = utils();

    // Function that lists the ip and domains in hosts file
    self.list = function() {
        console.log("Populating list for " + utility.getFullFilePath());
    }

    // Function that backs up the current hosts file to the file provided by user.
    self.backup = function() {
        var backupFilePath = utility.getBackupFilePath();
        fs.copyFileSync(utility.getFullFilePath(), backupFilePath);
        console.log("Backed up successfully to " + backupFilePath);
    }

    return self;
}

