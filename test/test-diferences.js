"use strict";

var expect = require('expect.js');
var sinon = require('sinon');

var selfExplain = require('../lib/self-explain.js');
var assert = selfExplain.assert;

var changing = require('best-globals').changing;

[
    {functionName: 'diferences'   , strict:true },
    {functionName: 'bigDiferences', strict:false},
].forEach(function(fixture){
    describe("diferences with "+fixture.functionName, function(){
        var diferences = assert[fixture.functionName];
        it("inform diferent types", function(){
            if(fixture.strict){
                expect(diferences(7, "7")).to.eql('typeof: number != string');
            }else{
                expect(diferences(7, "7")).to.eql(null);
            }
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