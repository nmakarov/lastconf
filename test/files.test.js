var should = require("should");

const lastconf = require("../lastconf");
const {loadJSON, loadJS, loadYaml, loadJson5, loadIni} = lastconf();

describe("Loading files test", () => {
	let dir = "./test/fixtures/random";
	let opts = {
		dir
	};

	describe("Loading JSON files", () => {
		it("loading existing .json", () => {
			const data = loadJSON("random", dir);
			data.key.should.be.equal("value");
		});
		it("loading non-existent whatever.json", () => {
			const data = loadJSON("whatever", dir);
			data.should.be.an.Object();
			data.should.be.empty();
			// should(data).be.undefined();
		});
		xit("loading corrupted.json", () => {
			should(loadJSON("corrupted", dir)).throw();
		});
	});

	describe("Loading JS files", () => {
		it("loading existing .js", () => {
			const data = loadJS("random", dir);
			data.key.should.be.equal("value");
		});
		it("loading non-existent whatever.js", () => {
			const data = loadJS("whatever", dir);
			data.should.be.an.Object();
			data.should.be.empty();
		});
	});

	describe("Loading YAML files", () => {
		it("loading existing .yaml", () => {
			const data = loadYaml("random", dir);
			data.skill.should.be.equal("medium");
			data.color.hear.should.be.equal("black");
		});
		it("loading non-existent whatever.yaml", () => {
			const data = loadYaml("whatever", dir);
			data.should.be.an.Object();
			data.should.be.empty();
		});
	});

	describe("Loading JSON5 files", () => {
		it("loading existing .json5", () => {
			const data = loadJson5("random", dir);
			data.outer.inner.should.be.equal("ok");
		});
		it("loading non-existent whatever.json5", () => {
			const data = loadJson5("whatever", dir);
			data.should.be.an.Object();
			data.should.be.empty();
		});
	});

	describe("Loading INI files", () => {
		it("loading existing .ini", () => {
			const data = loadIni("random", dir);
			data.toplevel.should.be.equal("ok");
			data.database.host.should.be.equal("localhost");
			data.outer.inner.key.should.be.equal("value");
		});
		it("loading non-existent whatever.ini", () => {
			const data = loadIni("whatever", dir);
			data.should.be.an.Object();
			data.should.be.empty();
		});
	});
});
