const conf = require("../../lastconf");
console.info(">> [module] somekey:", conf.get("somekey"));
console.info(">> [module] nested:", conf.get("nestedkey"));
