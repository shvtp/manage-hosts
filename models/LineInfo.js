class LineInfo {
    constructor(lineNumber) {
        // Line number in hosts file
        this.lineNumber = lineNumber !== undefined ? lineNumber + 1 : null;
        // Full content of the line
        this.rawData = '';
        // Is line empty (new line)
        this.isEmpty = false;
        // Is valid ip domain enrty
        this.isValid = false;
        // Is this hosts entry part of a user defined group
        this.isGroupInfo = false;
        // Parsed line data. Can be either group info (comments added before a set of entries) or 
        // IP - domain set as individual line
        this.lineData = '';
        // Details of group info (comments added before a set of entries)
        // Currently supports env parsing in the format
        // <Group Name - Can be project or domain><SPACE><Environment - 'dev','local','prod','uat','stage'>
        // For example
        //      #mydomain.com uat
        //      #domain local
        this.groupInfo = {};
        // IP
        this.ip = '';
        // Domains - list of all domains mentioned in the line
        this.domains = [];
        // Is entry active - If the line is commented out, it is marked as
        this.isActive = false;
    }
}

module.exports = LineInfo;