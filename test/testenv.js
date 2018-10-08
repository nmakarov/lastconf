// run as NESTED__SOMEVAR=aaaaa node test/testenv.js
const lastconf = require("../lastconf")({
	debug: true,
	location: "script",
	defaults: { 
		nested: {
			somevar: null
		}
	}
});

console.info(">> nested.somevar:", lastconf.get("nested.somevar"));
