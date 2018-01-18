var should = require("should");

const lastconf = require("../lastconf");

describe("Sanity test", () => {
	it("Works", () => {
		const conf = lastconf(null, {testkey: "testvalue"});
		conf.get("testkey").should.be.equal("testvalue");
		should(conf.get("whatever")).be.undefined();
	});
});
