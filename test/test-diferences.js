"use strict";

var expect = require('expect.js');
var sinon = require('sinon');

var changing = require('best-globals').changing;

var selfExplain = require('../lib/self-explain.js');
var assert = selfExplain.assert;

describe("differences", function(){
    selfExplain.assert.allDifferences.opts.maxDifferences = 1;
    it("inform allDifferences with mixed types", function(){
        expect(assert.allDifferences(7, "7")).to.be('7 != "7"');
    });
    it("inform differences opts.autoTypeCast with mixed types", function(){
        expect(assert.differences(7, "7", {autoTypeCast:true})).to.be(null);
    });
    it("inform bigDifferences with mixed types", function(){
        expect(assert.bigDifferences(7, "7")).to.be(null);
    });
    it("inform differences opts.delta", function(){
        expect(assert.differences(9.41, 9.418, {delta:0.01 })).to.be(null);
        expect(assert.differences(9.41, 9.418, {delta:0.001})).to.be(9.41-9.418);
    });
});

[
    {functionName: 'allDifferences', strict:true },
    {functionName: 'bigDifferences', strict:false},
].forEach(function(mode){
    describe("fixtures differences with "+mode.functionName, function(){
        selfExplain.assert.allDifferences.opts.maxDifferences = 1;
        var differences = assert[mode.functionName];
        it("equals inform null", function(){
            var a={};
            expect(differences(a, a)).to.be(null);
        });
        [
            {a: 0     , b:"0"   , expect:'0 != "0"'                         , expectBigDif:null },
            {a: 19021 , b:19201 , expect:-180                               },
            {a: "1"   , b:0     , expect:'"1" != 0'                         , expectBigDif:1},
            {a: 1, b:0.99999998 , skipped: '#1', expect:1-0.99999998        , expectBigDif:null},
            {a: "man" , b:"men" , expect:'"man" != "men"'},
            {a: "¡ !" , b:"¡\t!", expect:'"¡ !" != '+JSON.stringify("¡\t!")},
            {a: "the man in the middle", skipped: '#3', 
             b: "the man in the midle" , expect:'.substr(18,10): "dle" != "le"'},
            {a: "L1\nL2\nL3\nL4a\nL5a" , 
             b: "L1\nL2\nL3\nX4b\nL5b" , expect:'.split(/\\n/)[3]: "L4a" != "X4b"\n...', expectBigDif: '.split(/\\r?\\n/)[3]: "L4a" != "X4b"\n...'},
            {a: "one\ntwo"             , 
             b: "one\r\ntwo"           , expect:'.split(/\\n/)[0]: "one" != "one\\r"', expectBigDif:null},
            {a: ["one","two"]          , 
             b: ["one\r","two"]        , expect:'[0]: "one" != "one\\r"'      },
            {a: ["one"]                ,
             b: ["one",2]              , expect:'[1]: undefined != 2'         },
            {a: undefined , b:1        , expect:'undefined != 1'              },
            {skipped:'#7', a: new Date(1992,11,5)       , b:new Date(1935,8,1)         , expect:'1992-12-05 != 1935-08-01'},
            {skipped:'#7', a: new Date(1992,11,5,10,0,0), b:new Date(1935,8,1,15,0,0)  , expect:'1992-12-05 10:00:00 != 1935-08-01 15:00:00'},
            {skipped:'#7', a: new Date(1992,11,5,15,0,0), b:new Date(1992,11,5,10,10,0), expect:'04:50:00'},
            {skipped:'#7', a: new Date(1992,11,5,0,0,0),  b:new Date(1992,11,6,15,25,0), expect:'1992-12-05 != 1992-12-06 15:25:00 => -39:25:00'},
            {skipped:'#7', a: new Date(1992,11,5,0,0,0),  b:new Date(1992,11,6,15,25,0), expect:'1992-12-05 != 1992-12-06 15:25:00 => -39:25:00'},
            {skipped:'#7', a: new Date(1462670136585+100.25), b:new Date(1462670136585), expect:'00:01:40.250'},
            {a: {last:'Simpson', name:'Bart'}, b:{last:'Simpson', name:'Lisa'}, expect:'.name: "Bart" != "Lisa"'},
            {a: {name:'Hommer', last:'Simpson'}, b:{last:'Simpson', name:'Hommer'}, expect:'{0}: .name != .last\n...', expectBigDif:null},
            {a: {name:'Hommer', age:40}, b:{name:'Hommer'}, expect:'{1}: .age != undefined', expectBigDif:'.age: 40 != undefined'},
            {a: {name:'Hommer'}, b:{name:'Hommer', age:40}, expect:'{1}: undefined != .age', expectBigDif:'.age: undefined != 40'},
        ].forEach(function(fixture){
            if(fixture.skipped){ 
                it("detect fixture "+fixture.expect);
                return true; 
            }
            var expected = mode.strict || !('expectBigDif' in fixture)?fixture.expect:fixture.expectBigDif;
            it("detect fixture "+fixture.expect, function(){
                var diffs = differences(fixture.a, fixture.b);
                //console.log("diffs", diffs)
                expect(diffs).to.be(expected);
            });
        });
    });
});

describe("differences detailed", function(){
    selfExplain.assert.allDifferences.opts.maxDifferences = 1;
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
        expect(assert.allDifferences("A\nB\nC\nD\nE", "A\nb\n\C\nd\nE")).to.be('.split(/\\n/)[1]: "B" != "b"\n...');
        expect(assert.differences.callCount).to.eql(6);
        expect(assert.differences.args[0].slice(0,2)).to.eql(["A\nB\nC\nD\nE", "A\nb\n\C\nd\nE"]);
        expect(assert.differences.args[1].slice(0,2)).to.eql([["A", "B", "C", "D", "E"], ["A", "b", "C", "d", "E"]]);
        expect(assert.differences.args[2].slice(0,2)).to.eql(["A", "A"]);
        expect(assert.differences.args[3].slice(0,2)).to.eql(["B", "b"]);
        expect(assert.differences.args[4].slice(0,2)).to.eql(["C", "C"]);
        expect(assert.differences.args[5].slice(0,2)).to.eql(["D", "d"]);
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

describe("many differences", function(){
    it("show many differences in a string", function(){
        selfExplain.assert.allDifferences.opts.maxDifferences = 3;
        expect(
            assert.allDifferences("1,2,3,4,5,6,7", "1, '2', 3, IV", {split:/,\s*/})
        ).to.be(
            '.split(/,\\s*/)[1]: "2" != "\'2\'"\n'+
            '.split(/,\\s*/)[3]: "4" != "IV"\n'+
            '.split(/,\\s*/)[4]: "5" != undefined\n'+
            '...'
        );
    });
    it("show many bigDifferences in a complex object", function(){
        selfExplain.assert.allDifferences.opts.maxDifferences = 3;
        expect(
            assert.bigDifferences({
                name: 'Homer',
                last: 'Simpson',
                age: 40,
                childs: ['Bartolomeo', 'Lisa', 'the baby'],
                job: {
                    company: 'NASA',
                    skills: 'good'
                },
            },{
                last: 'Simpson',
                name: 'Homer',
                age: '40',
                childs: ['Bart', 'Lisa'],
                job: {
                    company: 'the nuclear plant',
                    number: 'zero',
                    friends: "don't remember"
                },
            })
        ).to.eql(
            '.childs[0]: "Bartolomeo" != "Bart"\n'+
            '.childs[2]: "the baby" != undefined\n'+
            '.job.company: "NASA" != "the nuclear plant"\n'+
            '.job.skills: "good" != undefined\n'+
            '.job.number: undefined != "zero"\n'+
            '...'
        );
    });
});
