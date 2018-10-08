const conf = require("../lastconf")({location: "script", debug: true});
require("./inner/module");
console.info(">> [main] somekey:", conf.get("somekey"));