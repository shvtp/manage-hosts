const helper = require("./utils");
/**
 * This file exports all available processing that can be done on the hosts file
 */
const fs = require('fs');

// Function that lists the ip and domains in hosts file
function list() {
    console.log("Populating list for " + helper.getFullFilePath());
}

// Function that backs up the current hosts file to the file provided by user.
function backup() {
    var backupFilePath = helper.getBackupFilePath();
    fs.copyFileSync(helper.getFullFilePath(), backupFilePath);
    console.log("Backed up successfully to " + backupFilePath);
}

var processes = {list: list, backup: backup};

module.exports = processes;

