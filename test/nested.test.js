var should = require("should");

const lastconf = require("../lastconf");
let folder = "./test/fixtures/nested";
let opts = {
	folder
};

describe("Loading files test", () => {

	describe("Loading files", () => {
		it("loading existing .json5", () => {
			const conf = lastconf.init(opts);
			conf.get("a").should.be.equal(1);
			conf.get("b.c").should.be.equal(4);
		});
	});
});
