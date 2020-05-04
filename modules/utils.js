const constants = require("./constants");
const moment = require("moment");

module.exports = helper;

function helper() {
    var self = {};

    /**
    * Function to get backup file path
    * @param {boolean} help 
    * 
    * If help is true then use only date format else use current time in file name
    * 
    * help param is used for displaying the backup file format in command line help descritpion
    */
    self.getBackupFilePath = function(help = false) {
        let backupFilePath = constants.filePath + constants.backupFileName;
        let dateString = help ? constants.defaultDateFormat : new moment().format(constants.defaultDateFormat);
        return backupFilePath + '-' + dateString;
    };

    /**
     * Function to get file path for the hosts file
     */
    self.getFullFilePath = function() {
        return constants.filePath + constants.fileName;
    };

    return self;
}