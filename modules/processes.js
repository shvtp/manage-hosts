const utils = require("./utils");
const contants = require("./constants");
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
        const fileData = readFile(utility.getFullFilePath());
        let lineInfo = [];
        let prevLineInfo = newLineInfo();
        fileData.forEach((line, lineNumber) => {
            let currentLineInfo = getLineInfo(line, lineNumber);
            if (!prevLineInfo.isValid && !prevLineInfo.isEmpty && currentLineInfo.isValid) {
                lineInfo[lineNumber - 1] = markAsGroup(prevLineInfo);
            }
            lineInfo[lineNumber] = currentLineInfo;
            prevLineInfo = currentLineInfo;
        });
        print(lineInfo);
    }

    // Function that backs up the current hosts file to the file provided by user.
    self.backup = function() {
        fs.copyFileSync(utility.getFullFilePath(), utility.getBackupFilePath());
        console.log("Backed up successfully to " + utility.getBackupFilePath());
    }

    function print(lineInfo) {
        lineInfo.forEach((info) => {
            let output = '';
            if (!info.isEmpty) {
                if (info.isValid) {
                    output += info.lineNumber;
                    output += ' ' + info.ip;
                    info.domains.forEach((domain) => {
                        output += ' ' + domain;
                    });
                    output += info.isActive ? ' ACTIVE' : ' DISABLED'
                } else if(info.groupInfo.name) {
                    output += info.lineNumber;
                    output += ' Group - ' + info.groupInfo.name;
                    if (info.groupInfo.env !== '') {
                        output += ' | Environment - ' + info.groupInfo.env;
                    }
                }
            }
            if (output !== '') {
                console.log(output);
            }
        });
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

    function markAsGroup(lineInfo) {
        var env = '';
        contants.env.forEach((e) => {
            if (lineInfo.lineData.toLowerCase().indexOf(e) !== -1) {
                env = e;
                return;
            }
        });
        lineInfo.groupInfo = {
            name: lineInfo.lineData,
            env: env
        };
        lineInfo.isGroupInfo = true;
        return lineInfo;
    }

    return self;
}

function newLineInfo(lineNumber) {
    var self = {
        lineNumber: lineNumber + 1,

        rawData: '',

        isEmpty: false,

        // Is valid ip domain enrty
        isValid: false,

        isGroupInfo: false,

        lineData: '',

        // Details of group info
        groupInfo: {},

        // IP
        ip: '',

        // Domains
        domains: [],

        // Is entry active
        isActive: false
    };

    return self;
}

