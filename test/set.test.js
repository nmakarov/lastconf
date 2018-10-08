var should = require("should");

const lastconf = require("../lastconf");

describe("Set/get keys test", () => {
	let opts = {
		defaults: {
			key1: "value1"
		}
	};

	it("simple set works", () => {
		const conf = lastconf.init(opts);
		conf.set("key1", "value2");
		conf.get("key1").should.be.equal("value2");
	});

	it("set works multiple levels deep", () => {
		const conf = lastconf.init(opts);
		conf.set("a.b.c", "xyz");
		conf.get("a.b.c").should.be.equal("xyz");
	});
});
