#! /usr/bin/env node

const options = require("./options");
const yargs = require("yargs");


(function main() {
    // Parsing arguments
    var argv = yargs.options(options).argv;

    if (Object.keys(argv).length == 2) {
        yargs.showHelp();
        return;
    }

    function getDependantOptions(optionProperties) {
        var optionsToCheck, dependantOptions = {options: {}, isValid: true};
        if (optionProperties.depends && (optionsToCheck = optionProperties.depends.options)) {
            if (typeof optionsToCheck === 'string') {
                dependantOptions.isValid = Boolean(argv[optionsToCheck]);
            } else {
                var isValid = false;
                optionsToCheck.forEach(opt => {
                    if ((isValid = isValid || argv[opt]) && argv[opt]) {
                        dependantOptions.options[opt] = argv[opt];
                    }
                });
                dependantOptions.isValid = isValid;
            }
        }
        return dependantOptions;
    }

    // Processing arguments
    for(let option in options) {

        // Option properties object containing info about option
        let optionProperties = options[option];

        // Argument value obtained while parsing arguments.
        // If argValue is present then the option was passed as argument
        let argValue = argv[option];
        try {

            // Is option passed as argument
            if (argValue) {

                // Validating dependent options.
                let dependantOptions = getDependantOptions(optionProperties);
                if (!dependantOptions.isValid) {
                    yargs.showHelp();
                    console.log("Missing required options. " + optionProperties.depends.describe || "Please check the help menu.")
                    return;
                }
                
                // Execute callBackFn if option is passed as argument
                // and call back function is defined in option properties
                if (
                    // Callback property present
                    optionProperties.callBackFn &&
                    
                    // Is call back property callable
                    typeof optionProperties.callBackFn === 'function'
                ) {
                    options[option].callBackFn(dependantOptions.options);
                }
            }
        } catch (error) {
            console.error(
                "Error occurred while parsing option values for option --" + optionProperties.alias + " (-" + option + ")"
            );
            console.error(error);
        }

    }
})();