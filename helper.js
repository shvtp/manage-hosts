const constants = require("./constants");
const moment = require("moment");

/**
 * Function to get backup file path
 * @param {boolean} help 
 * 
 * If help is true then use only date format else use current time in file name
 * 
 * help param is used for displayinh th backup file format in command line help descritpion
 */
function getBackupFilePath(help = false) {
    let backupFilePath = constants.filePath + constants.backupFileName;
    let dateString = help ? constants.defaultDateFormat : new moment().format(constants.defaultDateFormat);
    return backupFilePath + '-' + dateString;
}

/**
 * Function to get file path for the hosts file
 */
function getFullFilePath() {
    return constants.filePath + constants.fileName;
}

var helper = {
    getBackupFilePath: getBackupFilePath,
    getFullFilePath: getFullFilePath
};

module.exports = helper;