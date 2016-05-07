"use strict";

var expect = require('expect.js');
var sinon = require('sinon');

var selfExplain = require('../lib/self-explain.js');
var assert = selfExplain.assert;

var changing = require('best-globals').changing;

describe("diferences", function(){
    it("inform allDiferences with mixed types", function(){
        expect(assert.allDiferences(7, "7")).to.eql('typeof: number != string');
    });
    it("inform diferences opts.autoTypeCast with mixed types", function(){
        expect(assert.diferences(7, "7", {autoTypeCast:true})).to.be(null);
    });
    it("inform bigDiferences with mixed types", function(){
        expect(assert.bigDiferences(7, "7")).to.be(null);
    });
    it.skip/*#1*/("inform diferences opts.delta ", function(){
        expect(assert.diferences(9.41, 9.418, {delta:0.01 })).to.be(null);
        expect(assert.diferences(9.41, 9.418, {delta:0.001})).to.be(9.41-9.418);
    });
});

[
    {functionName: 'allDiferences', strict:true },
    {functionName: 'bigDiferences', strict:false},
].forEach(function(mode){
    describe("diferences with "+mode.functionName, function(){
        var diferences = assert[mode.functionName];
        it("equals inform null", function(){
            var a={};
            expect(diferences(a, a)).to.be(null);
        });
        [
            {a: 0     , b:"0"   , expect:'typeof: number != string'         , expectBigDif:null },
            {a: 19021 , b:19201 , expect:-180                               },
            {a: "1"   , b:0     , expect:'typeof: string != number'         , expectBigDif:1},
            {a: 1, b:0.99999999 , skipped: '#1', expect:1-0.99999999        , expectBigDif:null},
            {a: "man" , b:"men" , skipped: '#2', expect:'string: "man" != "men"'},
            {a: "¡ !" , b:"¡\t!", skipped: '#2', expect:'string: "¡ !" != '+JSON.stringify("¡\t!")},
            {a: "the man in the middle", skipped: '#3', 
             b: "the man in the midle" , expect:'substr(18,10): "dle" != "le"'},
        ].forEach(function(fixture){
            if(fixture.skipped){ return true; }
            var expected = mode.strict || !('expectBigDif' in fixture)?fixture.expect:fixture.expectBigDif;
            it("detect fixture "+fixture.message, function(){
                expect(diferences(fixture.a, fixture.b)).to.be(expected);
            });
        });
    });
});

describe("assert with diferences", function(){
    it("inform all", function(){
        var seven = 7;
        assert.collect();
        expect(function(){
            eval(assert(!assert.diferences(seven, '7')))
        }).to.throwError(/assert.*failed/);
        expect(assert.collected()).to.eql([
            ['ASSERT FAILED'],
            ["!assert.diferences(seven, '7')", '====', false],
            ["assert.diferences(seven, '7')" , '====', 'typeof: number != string'],
            ['seven' , '====', 7],
        ]);
    });
});