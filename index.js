const options = require("./options");
const yargs = require("yargs");


(function main() {
    // Parsing arguments
    var argv = yargs.options(options).argv;

    // Processing arguments
    for(let option in options) {
        // Option properties object containing info about option
        let optionProperties = options[option];

        // Argument value obtained while parsing arguments.
        // If argValue is present then the option was passed as argument
        let argValue = argv[option];
        try {
            // Execute callBackFn if option is passed as argument
            // and call back function is defined in option properties
            if (
                // Is option passed as argument
                argValue &&

                // Callback property present
                optionProperties.callBackFn &&
                
                // Is call back property callable
                typeof optionProperties.callBackFn === 'function'
            ) {
                options[option].callBackFn(argValue);
            }
        } catch (error) {
            console.error(
                "Error occurred while parsing option values for option --" + optionProperties.alias + " (-" + option + ")"
            );
            console.error(error);
        }

    }
})();