var should = require("should");

const lastconf = require("../lastconf");
let dir = "./test/fixtures/nested";
let opts = {
	dir
};
const conf = lastconf(opts);

describe("Loading files test", () => {

	describe("Loading files", () => {
		it("loading existing .json5", () => {
			conf.get("a").should.be.equal(1);
			conf.get("b.c").should.be.equal(4);
		});
	});
});
