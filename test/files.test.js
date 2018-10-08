var should = require("should");

const lastconf = require("../lastconf");

describe("Loading files test", () => {
	let folder = "./test/fixtures/random";
	let opts = {
		folder
	};

	describe("Loading JSON files", () => {
		it("loading existing .json", () => {
			const data = lastconf.loadJSON("random", folder);
			data.key.should.be.equal("value");
		});
		it("loading non-existent whatever.json", () => {
			const data = lastconf.loadJSON("whatever", folder);
			data.should.be.an.Object();
			data.should.be.empty();
			// should(data).be.undefined();
		});
		it("loading corrupted.json", () => {
			should(() => lastconf.loadJSON("corrupted", folder)).throw();
		});
	});

	describe("Loading JS files", () => {
		it("loading existing .js", () => {
			const data = lastconf.loadJS("random", folder);
			data.key.should.be.equal("value");
		});
		it("loading non-existent whatever.js", () => {
			const data = lastconf.loadJS("whatever", folder);
			data.should.be.an.Object();
			data.should.be.empty();
		});
	});

	describe("Loading YAML files", () => {
		it("loading existing .yaml", () => {
			const data = lastconf.loadYaml("random", folder);
			data.skill.should.be.equal("medium");
			data.color.hear.should.be.equal("black");
		});
		it("loading non-existent whatever.yaml", () => {
			const data = lastconf.loadYaml("whatever", folder);
			data.should.be.an.Object();
			data.should.be.empty();
		});
	});

	describe("Loading JSON5 files", () => {
		it("loading existing .json5", () => {
			const data = lastconf.loadJson5("random", folder);
			data.outer.inner.should.be.equal("ok");
		});
		it("loading non-existent whatever.json5", () => {
			const data = lastconf.loadJson5("whatever", folder);
			data.should.be.an.Object();
			data.should.be.empty();
		});
	});

	describe("Loading INI files", () => {
		it("loading existing .ini", () => {
			const data = lastconf.loadIni("random", folder);
			data.toplevel.should.be.equal("ok");
			data.database.host.should.be.equal("localhost");
			data.outer.inner.key.should.be.equal("value");
		});
		it("loading non-existent whatever.ini", () => {
			const data = lastconf.loadIni("whatever", folder);
			data.should.be.an.Object();
			data.should.be.empty();
		});
	});
});
