const constants = {
    fileName: 'hosts',
    backupFileName: 'hosts.bkp.manage-hosts',
    filePath: '/etc/',
    defaultDateFormat: 'YYYY-MM-DDTHH-mm-ss',
    regex: {
        ipDomain: /^(#+)?(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})([\s\S]+)$/gi,
        comment: /^(#+)?([\s\S]+)$/gi
    },
    env: ['dev','local','prod','uat','stage']
}

module.exports = constants;