/** *****************************
         Check Install
*******************************/

let
  // node dependencies
    gulp = require("gulp"),
    fs = require("fs"),
    console = require("better-console"),
    install = require("./config/project/install")
    ;

// export task
module.exports = function () {
    setTimeout(() => {
        if (!install.isSetup()) {
            console.log("Starting install...");
            gulp.start("install");
            return;
        }
        gulp.start("watch");
    }, 50); // Delay to allow console.clear to remove messages from check event
};
