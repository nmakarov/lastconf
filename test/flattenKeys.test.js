var should = require("should");
var expect = require("expect");

const flattenKeys = require("../lastconf")().flattenKeys;

describe("flattenKeys", () => {
	it("works on a simple arrays", () => {
		flattenKeys({aAa: "bbb", Ccc: "zzz"}).should.containDeep(['aaa', 'ccc']);
	});

	it("works on a nested arrays", () => {
		flattenKeys({aAa: "bbb", Ccc: {ddd:"eee"}}).should.containDeep(['aaa', 'ccc__ddd']);
		flattenKeys({aAa: "bbb", Ccc: {ddd:"eee"}}, '.').should.containDeep(['aaa', 'ccc.ddd']);
	});

	it("works on a deeply nested arrays", () => {
		const obj = {
			item1: "value1",
			item2: {
				item21: "value21",
				item22: {
					item221: "value221"
				},
			},
			item3: "value3",
		};
		flattenKeys(obj).should.containDeep(['item1', 'item2__item21', 'item2__item22__item221', 'item3']);
	});

});