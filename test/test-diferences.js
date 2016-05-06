"use strict";

var expect = require('expect.js');
var sinon = require('sinon');

var selfExplain = require('../lib/self-explain.js');
var assert = selfExplain.assert;

var changing = require('best-globals').changing;

[
    {functionName: 'diferences'   , strict:true },
    {functionName: 'bigDiferences', strict:false},
].forEach(function(mode){
    describe("diferences with "+mode.functionName, function(){
        it("equals inform null", function(){
            var a={};
            expect(diferences(a, a)).to.eql(null);
        });
        it("inform diferent types", function(){
            if(mode.strict){
                expect(diferences(7, "7")).to.eql('typeof: number != string');
            }else{
                expect(diferences(7, "7")).to.eql(null);
            }
        });
        var diferences = assert[mode.functionName];
        [
            {a: 0    , b:"0"  , expect:'typeof: number != string'         , expectNotStrict:null },
            {a: 19021, b:19201, expect:-180                               },
            {a: "1"  , b:0    , expect:'typeof: string != number'         , expectNotStrict:1},
            {a: 1, b:0.999999 , skipped: '#1', expect:1-0.999999          , expectNotStrict:null},
        ].forEach(function(fixture){
            if(fixture.skipped){ return true; }
            var expected = mode.strict || !('expectNotStrict' in fixture)?fixture.expect:fixture.expectNotStrict;
            it("detect fixture "+fixture.message, function(){
                expect(diferences(fixture.a, fixture.b)).to.eql(expected);
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