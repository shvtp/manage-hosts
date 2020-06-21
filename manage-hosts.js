const { exit } = require("process");

;(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    global.manageHosts = factory()
}(this, (function () {
    'use strict';

    const fs = require("fs");
    const moment = require("moment");
    const os = require("os");
    const LineInfo = require("./models/LineInfo");
    const GroupInfo = require("./models/GroupInfo");

    const constants = {
        fileName: 'hosts',
        backupFileNamePostfix: '.bkp.manage-hosts',
        filePath: '/etc/',
        defaultDateFormat: 'YYYY-MM-DDTHH-mm-ss',
        regex: {
            ipDomain: /^(#+)?(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})([\s\S]+)$/gi,
            comment: /^(#+)?([\s\S]+)$/gi
        },
        env: ['dev','local','prod','uat','stage'],
        defaultGroupNamePrefix: 'Group #'
    };

    var hostsFilePath,
        backupFileName;

    function init(defaultFileName) {
        hostsFilePath = defaultFileName || constants.filePath + constants.fileName;
        backupFileName = hostsFilePath + constants.backupFileNamePostfix;
    }

    function search(optionPassed) {
        var [parsedData, indices] = searchLineInfo(optionPassed),
            dataToReturn = [];

        indices.forEach((index) => {
            dataToReturn.push(parsedData[index])
        });
        return formatByGroup(dataToReturn);
    }

    function formatByGroup(lineInfos) {
        var returnData = {};
        lineInfos.forEach((lineInfo) => {
            let groupId = lineInfo.groupInfo.id;
            if (!returnData.hasOwnProperty(groupId)) {
                returnData[groupId] = {
                    groupInfo: lineInfo.groupInfo,
                    lineInfos: []
                }
            }
            returnData[groupId].lineInfos.push(lineInfo);
        });
        return returnData;
    }

    function readFile() {
        const file = fs.readFileSync(hostsFilePath).toString();
        return file.split(os.EOL);
    }

    function parseFileData() {
        const fileData = readFile();
        var parsedData = [];
        var prevLineInfo = new LineInfo();
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

    function getLineInfo(lineData, lineNumber) {
        var info = new LineInfo(lineNumber);
        info.rawData = lineData;
        lineData = lineData.trim();
        info.isEmpty = lineData === '';
        if (!info.isEmpty) {
            let ipDomainInfo = [...lineData.matchAll(constants.regex.ipDomain)];
            if (ipDomainInfo.length) {
                info.lineData = lineData;
                info.isValid = true;
                info.ip = ipDomainInfo[0][2].trim();
                info.domains = ipDomainInfo[0][3].trim().split(/\s/);
                info.isActive = ipDomainInfo[0][1] === undefined
            } else {
                let commentInfo = [...lineData.matchAll(constants.regex.comment)];
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

    function getGroupInfo(lineInfo, groupId) {
        var env = getEnvFromLineData(lineInfo.lineData);
        var name = lineInfo.lineData || constants.defaultGroupNamePrefix + groupId;
        if (env !== '') {
            var index = lineInfo.lineData.toLowerCase().indexOf(env);
            name = lineInfo.lineData.slice(0, index - 1).trim() || constants.defaultGroupNamePrefix + groupId;
        }
        return new GroupInfo(groupId, name, env);
    }

    function getEnvFromLineData(lineData) {
        var env = '';
        constants.env.forEach((e) => {
            if (lineData.toLowerCase().indexOf(e) !== -1) {
                env = e;
                return;
            }
        });
        return env;
    }

    function getBackupFilePath(help = false) {
        return backupFileName + '-' + (help ? constants.defaultDateFormat : new moment().format(constants.defaultDateFormat));
    };

    function backup(verbose) {
        var backupFilePath = getBackupFilePath();
        fs.copyFileSync(hostsFilePath, backupFilePath);
        if (verbose)
            console.log("Backed up successfully to " + backupFilePath);
        return backupFilePath;
    }

    function restore(filePath) {
        fs.copyFileSync(filePath, hostsFilePath);
    }

    function activate(optionPassed) {
        var [parsedData, indices] = searchLineInfo(optionPassed),
            dataToPrint = [];

        indices.forEach((index) => {
            parsedData[index].isActive = true;
            parsedData[index].rawData = parsedData[index].rawData.replace(/^#/, '');
            dataToPrint.push(parsedData[index])
        });
        if (updateFile(parsedData))
            return formatByGroup(dataToPrint);
    }

    function deActivate(optionPassed) {
        var [parsedData, indices] = searchLineInfo(optionPassed),
            dataToPrint = [];
        indices.forEach((index) => {
            parsedData[index].isActive = false;
            parsedData[index].rawData = '#' + parsedData[index].rawData;
            dataToPrint.push(parsedData[index])
        });
        if (updateFile(parsedData))
            return formatByGroup(dataToPrint);
    };

    function searchLineInfo(optionPassed) {
        if (!optionPassed) {
            throw new Error('Insufficient arguments passed. Require line number or group number');
        }
        var parsedData = parseFileData();
        var dataToSearch = parsedData;
        var indices = [];
        for(var option in optionPassed) {
            if(optionPassed.hasOwnProperty(option)) {
                let optionValue = typeof optionPassed[option] === 'string' ?
                    optionPassed[option].toLowerCase() : optionPassed[option];
                [dataToSearch, indices] = searchByOptionValue(dataToSearch, option, optionValue);
            }
        }
        return [parsedData, indices];
    }

    function searchByOptionValue(dataToSearch, option, optionValue) {
        var indices = [];
        var updateDataToSearch = [];
        dataToSearch.forEach((lineInfo, index) => {
            if (
                lineInfo.isValid &&
                (
                    (option === 'L' && lineInfo.lineNumber == optionValue) ||
                    (option === 'G' && lineInfo.groupInfo.id == optionValue) ||
                    (
                        option === 'g' &&
                        lineInfo.groupInfo.name &&
                        -1 !== lineInfo.groupInfo.name.toLowerCase().indexOf(optionValue)
                    ) ||
                    (
                        option === 'e' &&
                        lineInfo.groupInfo.env &&
                        -1 !== lineInfo.groupInfo.env.toLowerCase().indexOf(optionValue)
                    )
                )
            ) {
                indices.push(index);
                updateDataToSearch[index] = lineInfo;
            }
        });
        return [updateDataToSearch, indices];
    }

    function updateFile(parsedData) {
        var backupFilePath = backup();
        var status = true;
        var dataToWrite = '';
        parsedData.forEach(lineInfo => {
            dataToWrite += lineInfo.rawData + os.EOL;
        });
        fs.writeFile(hostsFilePath, dataToWrite, (error) => {
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

    var Hosts = function(fileName) {
        init(fileName);
        this.backup = backup;
        this.activate = activate;
        this.deActivate = deActivate;
        this.search = search;
        this.getBackupFilePath = getBackupFilePath;
    };

    return Hosts;

})));