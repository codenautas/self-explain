"use strict";

var expect = require('expect.js');
var sinon = require('sinon');

var changing = require('best-globals').changing;

var selfExplain = require('../lib/self-explain.js');
var assert = selfExplain.assert;

describe("differences", function(){
    it("inform allDifferences with mixed types", function(){
        expect(assert.allDifferences(7, "7")).to.be('7 != "7"');
    });
    it("inform differences opts.autoTypeCast with mixed types", function(){
        expect(assert.differences(7, "7", {autoTypeCast:true})).to.be(null);
    });
    it("inform bigDifferences with mixed types", function(){
        expect(assert.bigDifferences(7, "7")).to.be(null);
    });
    it.skip/*#1*/("inform differences opts.delta ", function(){
        expect(assert.differences(9.41, 9.418, {delta:0.01 })).to.be(null);
        expect(assert.differences(9.41, 9.418, {delta:0.001})).to.be(9.41-9.418);
    });
});

[
    {functionName: 'allDifferences', strict:true },
    {functionName: 'bigDifferences', strict:false},
].forEach(function(mode){
    describe("fixtures differences with "+mode.functionName, function(){
        var differences = assert[mode.functionName];
        it("equals inform null", function(){
            var a={};
            expect(differences(a, a)).to.be(null);
        });
        [
            {a: 0     , b:"0"   , expect:'0 != "0"'                         , expectBigDif:null },
            {a: 19021 , b:19201 , expect:-180                               },
            {a: "1"   , b:0     , expect:'"1" != 0'                         , expectBigDif:1},
            {a: 1, b:0.99999999 , skipped: '#1', expect:1-0.99999999        , expectBigDif:null},
            {a: "man" , b:"men" , expect:'"man" != "men"'},
            {a: "¡ !" , b:"¡\t!", expect:'"¡ !" != '+JSON.stringify("¡\t!")},
            {a: "the man in the middle", skipped: '#3', 
             b: "the man in the midle" , expect:'.substr(18,10): "dle" != "le"'},
            {a: "L1\nL2\nL3\nL4a\nL5a" , 
             b: "L1\nL2\nL3\nX4b\nL5b" , expect:'.split(/\\n/)[3]: "L4a" != "X4b"', expectBigDif: '.split(/\\r?\\n/)[3]: "L4a" != "X4b"'},
            {a: "one\ntwo"             , 
             b: "one\r\ntwo"           , expect:'.split(/\\n/)[0]: "one" != "one\\r"', expectBigDif:null},
            {a: ["one","two"]          , 
             b: ["one\r","two"]        , expect:'[0]: "one" != "one\\r"'      },
            {a: ["one"]                ,
             b: ["one",2]              , expect:'[1]: undefined != 2'         },
            {a: undefined , b:1        , expect:'undefined != 1'              },
        ].forEach(function(fixture){
            if(fixture.skipped){ 
                it("detect fixture "+fixture.expect);
                return true; 
            }
            var expected = mode.strict || !('expectBigDif' in fixture)?fixture.expect:fixture.expectBigDif;
            it("detect fixture "+fixture.expect, function(){
                expect(differences(fixture.a, fixture.b)).to.be(expected);
            });
        });
    });
});

describe("differences detailed", function(){
    it("inform all in assert", function(){
        var seven = 7;
        assert.collect();
        expect(function(){
            eval(assert(!assert.differences(seven, '7')))
        }).to.throwError(/assert.*failed/);
        expect(assert.collected()).to.eql([
            ['ASSERT FAILED'],
            ["!assert.differences(seven, '7')", '====', false],
            ["assert.differences(seven, '7')" , '====', '7 != "7"'],
            ['seven' , '====', 7],
        ]);
    });
    it("could choice line separator", function(){
        expect(assert.differences("one, two", "one,other", {split:/,\s*/})).to.be('.split(/,\\s*/)[1]: "two" != "other"');
    });
    it("call differences for string when comparing parts", function(){
        sinon.spy(assert, "differences");
        expect(assert.allDifferences("A\nB\nC", "A\nb\n\C")).to.be('.split(/\\n/)[1]: "B" != "b"');
        expect(assert.differences.callCount).to.eql(4);
        expect(assert.differences.args[0].slice(0,2)).to.eql(["A\nB\nC", "A\nb\n\C"]);
        expect(assert.differences.args[1].slice(0,2)).to.eql([["A", "B", "C"], ["A", "b", "C"]]);
        expect(assert.differences.args[2].slice(0,2)).to.eql(["A", "A"]);
        expect(assert.differences.args[3].slice(0,2)).to.eql(["B", "b"]);
        assert.differences.restore();
    });
    it("call differences for each element when comparing arrays", function(){
        sinon.spy(assert, "differences");
        expect(assert.allDifferences([1], [1, null])).to.be('[1]: undefined != null');
        expect(assert.differences.callCount).to.eql(3);
        expect(assert.differences.args[0].slice(0,2)).to.eql([[1], [1, null]]);
        expect(assert.differences.args[1].slice(0,2)).to.eql([1, 1]);
        expect(assert.differences.args[2].slice(0,2)).to.eql([undefined, null]);
        assert.differences.restore();
    });
});