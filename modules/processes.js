const utils = require("./utils");
const contants = require("./constants");
const colors = require("colors");
const fs = require("fs");
const os = require("os");
/**
 * This file exports all available processing that can be done on the hosts file
 */

module.exports = processes;
function processes() {
    var self = {};

    const utility = utils();

    // Function that lists the ip and domains in hosts file
    self.list = function() {
        print(parseFileData());
    }

    // Wrapper to function that backs up the current hosts file to the file provided by user.
    self.backup = function() {
        return backupFile(true);
    }

    // Function that backs up the current hosts file to the file provided by user.
    function backupFile(verbose) {
        var backupFilePath = utility.getBackupFilePath();
        fs.copyFileSync(utility.getFullFilePath(), backupFilePath);
        if (verbose)
            console.log("Backed up successfully to " + backupFilePath);
        return backupFilePath;
    }

    function restore(filePath) {
        fs.copyFileSync(filePath, utility.getFullFilePath());
    }

    // Function that activate line or group number
    self.activate = function(optionPassed) {
        var [parsedData, indices] = getLineInfoToModify(optionPassed),
            dataToPrint = [];

        indices.forEach((index) => {
            parsedData[index].isActive = true;
            parsedData[index].rawData = parsedData[index].rawData.replace(/^#/, '');
            dataToPrint.push(parsedData[index])
        });
       if (updateFile(parsedData))
            print(dataToPrint);
    };

    // Function that activate line or group number
    self.deActivate = function(optionPassed) {
        var [parsedData, indices] = getLineInfoToModify(optionPassed),
            dataToPrint = [];
        indices.forEach((index) => {
            parsedData[index].isActive = false;
            parsedData[index].rawData = '#' + parsedData[index].rawData;
            dataToPrint.push(parsedData[index])
        });
        if (updateFile(parsedData))
            print(dataToPrint);
    };

    function updateFile(parsedData) {
        var backupFilePath = backupFile();
        var status = true;
        var dataToWrite = '';
        parsedData.forEach(lineInfo => {
            dataToWrite += lineInfo.rawData + os.EOL;
        });
        fs.writeFile(utility.getFullFilePath(), dataToWrite, (error) => {
            if (error) {
                restore(backupFilePath);
                console.log('Failed to update file.');
                console.log(error);
                status = false;
            }
            fs.unlinkSync(backupFilePath);
        });
        return status;
    }

    function getLineInfoToModify(optionPassed) {
        if (!optionPassed) {
            throw new Error('Insufficient arguments passed. Require line number or group number');
        }
        var option = Object.keys(optionPassed)[0];
        var optionValue = optionPassed[option];
        var parsedData = parseFileData();
        var indices = [];
        parsedData.forEach((lineInfo, index) => {
            if (lineInfo.isValid && ((option === 'n' && lineInfo.lineNumber == optionValue) || (option == 'g' && lineInfo.groupInfo.id == optionValue))) {
                indices.push(index);
            }
        });
        return [parsedData, indices];
    }

    function parseFileData() {
        const fileData = readFile(utility.getFullFilePath());
        var parsedData = [];
        var prevLineInfo = newLineInfo();
        var groupId = 1;
        var groupInfo = {};
        fileData.forEach((line, lineNumber) => {
            let currentLineInfo = getLineInfo(line, lineNumber);
            if (!prevLineInfo.isValid && currentLineInfo.isValid) {
                groupInfo = getGroupInfo(prevLineInfo, groupId);
                parsedData[lineNumber - 1].groupInfo = groupInfo;
                groupId++;
            }
            if (!currentLineInfo.isValid) {
                groupInfo = {};
            }
            currentLineInfo.groupInfo = groupInfo;
            parsedData[lineNumber] = currentLineInfo;
            prevLineInfo = currentLineInfo;
        });
        return parsedData;
    }

    function print(lineInfo) {
        var groupInfo;
        var groupId;
        lineInfo.forEach((info) => {
            let output = '';
            if (!info.isEmpty && info.isValid) {
                groupInfo = info.groupInfo;
                if (groupId !== groupInfo.id) {
                    output += os.EOL + '#' + groupInfo.id + os.EOL;
                    output += groupInfo.name.toUpperCase() + os.EOL;
                    if (groupInfo.env) {
                        output += groupInfo.env.toUpperCase() + os.EOL;
                    }
                    output += "Line\tIP Domains" + os.EOL;
                }
                output += '#' + info.lineNumber + "\t" + info.ip;
                info.domains.forEach((domain) => {
                    output += ' ' + domain;
                });
                groupId = groupInfo.id;
            }
            if (output !== '') {
                console.log(info.isActive ? output.green : output.red);
            }
        });
        console.log(os.EOL);
    }

    function readFile(filePath) {
        const file = fs.readFileSync(filePath).toString();
        return file.split(os.EOL);
    }

    function getLineInfo(lineData, lineNumber) {
        var info = newLineInfo(lineNumber);
        info.rawData = lineData;
        lineData = lineData.trim();
        info.isEmpty = lineData === '';
        if (!info.isEmpty) {
            let ipDomainInfo = [...lineData.matchAll(contants.regex.ipDomain)];
            if (ipDomainInfo.length) {
                info.lineData = lineData;
                info.isValid = true;
                info.ip = ipDomainInfo[0][2].trim();
                info.domains = ipDomainInfo[0][3].trim().split(/\s/);
                info.isActive = ipDomainInfo[0][1] === undefined
            } else {
                let commentInfo = [...lineData.matchAll(contants.regex.comment)];
                let comment = commentInfo[0][2].trim().replace(/#+/g, '');
                if (comment !== '') {
                    info.lineData = commentInfo[0][2].trim();
                } else {
                    info.isEmpty = true;
                }
            }
        }
        return info;
    }

    function getEnvFromLineData(lineData) {
        let env = '';
        contants.env.forEach((e) => {
            if (lineData.toLowerCase().indexOf(e) !== -1) {
                env = e;
                return;
            }
        });
        return env;
    }

    function getGroupInfo(lineInfo, groupId) {
        var env = getEnvFromLineData(lineInfo.lineData);
        var name = lineInfo.lineData || contants.defaultGroupNamePrefix + groupId;
        if (env !== '') {
            var index = lineInfo.lineData.toLowerCase().indexOf(env);
            name = lineInfo.lineData.slice(0, index - 1).trim() || contants.defaultGroupNamePrefix + groupId;
        }
    
        return newGroupInfo(groupId, name, env);
    }

    return self;
}

function newGroupInfo(id, name, env) {
    var self = {
        id: id,
        name: name,
        env: env
    }
    return self;
}

function newLineInfo(lineNumber) {
    var self = {
        // Line number in hosts file
        lineNumber: lineNumber !== undefined ? lineNumber + 1 : null,

        // Full content of the line
        rawData: '',

        // Is line empty (new line)
        isEmpty: false,

        // Is valid ip domain enrty
        isValid: false,

        // Is this hosts entry part of a user defined group
        isGroupInfo: false,

        // Parsed line data. Can be either group info (comments added before a set of entries) or 
        // IP - domain set as individual line
        lineData: '',

        // Details of group info (comments added before a set of entries)
        // Currently supports env parsing in the format
        // <Group Name - Can be project or domain><SPACE><Environment - 'dev','local','prod','uat','stage'>
        // For example
        //      #mydomain.com uat
        //      #domain local
        groupInfo: {},

        // IP
        ip: '',

        // Domains - list of all domains mentioned in the line
        domains: [],

        // Is entry active - If the line is commented out, it is marked as
        isActive: false
    };

    return self;
}

