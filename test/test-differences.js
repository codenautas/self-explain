"use strict";
/* ¡Atención! Este archivo debe verse en UTF-8: Sí */

var expectError;
var expectEql;

var assert = require('../lib/self-explain.js').assert;

function with_expect(){
    var expect = require('expect.js');
    expectError=function(x,re){ expect(x).to.throwException(re); };
    expectEql=function(a,b){ expect(a).to.eql(b); };
};
function with_self_explain(){
    expectEql=function(a,b){ 
        eval(assert(!assert.allDifferences(a,b))); 
    };
    expectError=function(x,re){ try{x(); throw new Error("Error expected"); }catch(err){ assert(re.test(err.message)); } };
};
with_expect();
//with_self_explain();

function Example(ini){
    for(var name in ini){
        this[name]=ini[name];
    }
}

Example.prototype.protoFunction = function(){};

describe("differences", function(){
    assert.allDifferences.opts.maxDifferences = 1;
    it("inform allDifferences with mixed types", function(){
        expectEql(assert.allDifferences(7, "7"), '7 != "7"');
    });
    it("inform differences opts.autoTypeCast with mixed types", function(){
        expectEql(assert.differences(7, "7", {autoTypeCast:true}), null);
    });
    it("inform bigDifferences with mixed types", function(){
        expectEql(assert.bigDifferences(7, "7"), null);
    });
    it("inform differences opts.delta ", function(){
        expectEql(assert.differences(9.41, 9.418, {delta:0.01 }), null);
        expectEql(assert.differences(9.41, 9.418, {delta:0.001}), 9.41-9.418);
    });
});

var fixture={a: {last:'Simpson', name:'Bart'}, b:{last:'Simpson', name:'Lisa'}, expect:'.name: "Bart" != "Lisa"'};
// it("detect fixture "+fixture.expect, function(){
    var dif = assert.allDifferences(fixture.a, fixture.b);
    //console.log("dif", dif)
    expectEql(dif, fixture.expect);
// });


[
    {functionName: 'allDifferences', strict:true },
    {functionName: 'bigDifferences', strict:false},
].forEach(function(mode){
    describe("fixtures differences with "+mode.functionName, function(){
        assert.allDifferences.opts.maxDifferences = 1;
        var differences = assert[mode.functionName];
        it("equals inform null", function(){
            var a={};
            expectEql(differences(a, a), null);
        });
        [
            {a: 0     , b:"0"   , expect:'0 != "0"'                         , expectBigDif:null },
            {a: 19021 , b:19201 , expect:-180                               },
            {a: "1"   , b:0     , expect:'"1" != 0'                         , expectBigDif:1},
            {a: 1, b:0.999999991, expect:1-0.999999991                      , expectBigDif:null},
            {a: "man" , b:"men" , expect:'"man" != "men"'},
            {a: "¡ !" , b:"¡\t!", expect:JSON.stringify("¡ !")+' != '+JSON.stringify("¡\t!")},
            {a: "the man in the middle", 
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
            {a: new Date(1992,11,5)       , b:new Date(1935,8,1)         , expect:'1992-12-05 != 1935-09-01'},
            {a: new Date(1992,11,5,10,0,0), b:new Date(1935,8,1,15,0,0)  , expect:'1992-12-05 10:00:00 != 1935-09-01 15:00:00'},
            {a: new Date(1992,11,5,15,0,0), b:new Date(1992,11,5,10,10,0), expect:'04:50:00'},
            {a: new Date(1992,11,5,0,0,0),  b:new Date(1992,11,6,15,25,0), expect:'1992-12-05 00:00:00 != 1992-12-06 15:25:00 => -39:25:00'},
            {a: new Date(1992,11,5,0,0,0,100),  b:new Date(1992,11,6,15,25,0,200), expect:'1992-12-05 00:00:00.100 != 1992-12-06 15:25:00.200 => -39:25:00.100'},
            {a: new Date(1462670136585+100250), b:new Date(1462670136585), expect:'00:01:40.250'},
            {a: {last:'Simpson', name:'Bart'}, b:{last:'Simpson', name:'Lisa'}, expect:'.name: "Bart" != "Lisa"'},
            {a: {name:'Hommer', last:'Simpson'}, b:{last:'Simpson', name:'Hommer'}, expect:'{0}: .name != .last\n...', expectBigDif:null},
            {a: {name:'Hommer', age:40}, b:{name:'Hommer'}, expect:'{1}: .age != undefined', expectBigDif:'.age: 40 != undefined'},
            {a: {name:'Hommer'}, b:{name:'Hommer', age:40}, expect:'{1}: undefined != .age', expectBigDif:'.age: undefined != 40'},
            {a: new Example({uno:1}), b: new Example({uno:1}), expect: null },
            {a: new Example({uno:1}), b: {uno:1}, expect: ".class: Example != Object", expectBigDif:null },
            {/*skip:'#14',*/ a: new Date(1993,11,5,10,0,0), b:'1993-12-05 10:00:00', expect:'1993-12-05 10:00:00 != "1993-12-05 10:00:00"', expectBigDif:'1993-12-05 10:00:00 != "1993-12-05 10:00:00"'},
            {/*skip:'#14',*/ a: {birth:new Date(1992,11,5,10,0,0)}, b:{birth:'1992-12-05 10:00:00'}, expect:'.birth: 1992-12-05 10:00:00 != "1992-12-05 10:00:00"', expectBigDif:'.birth: 1992-12-05 10:00:00 != "1992-12-05 10:00:00"'},
        ].forEach(function(fixture){
            if(fixture.skip){ 
                it("detect fixture "+fixture.expect);
                return true; 
            }
            var expected = mode.strict || !('expectBigDif' in fixture)?fixture.expect:fixture.expectBigDif;
            it("detect fixture "+fixture.expect, function(){
                var dif = differences(fixture.a, fixture.b);
                //console.log("dif", dif)
                expectEql(dif, expected);
            });
        });
    });
});

describe("differences detailed", function(){
    assert.allDifferences.opts.maxDifferences = 1;
    it("inform all in assert", function(){
        if(agentInfo.brief==='Safari 5.1.7' || agentInfo.brief==='IE 8.0'){
            return;
        }
        var seven = 7;
        assert.collect();
        expectError(function(){
            eval(assert(!assert.differences(seven, '7')))
        },/assert.*failed/);
        expectEql(assert.collected(), [
            ['ASSERT FAILED'],
            ["!assert.differences(seven, '7')", '====', false],
            ["assert.differences(seven, '7')" , '====', '7 != "7"'],
            ['seven' , '====', 7],
        ]);
    });
    it("could choice line separator", function(){
        expectEql(assert.differences("one, two", "one,other", {split:/,\s*/}), '.split(/,\\s*/)[1]: "two" != "other"');
    });
    var controlCall2Differences = function(fdif, expected, calls){
        var save=assert.differences;
        var collect=[];
        assert.differences=function(a,b,c,d,e){
            collect.push([a,b]);
            return save(a,b,c,d,e);
        }
        var obtained=fdif();
        assert.differences=save;
        expectEql(obtained, expected);
        expectEql(collect, calls);
    }
    it("call differences for string when comparing parts", function(){
        controlCall2Differences(function(){
            return assert.allDifferences("A\nB\nC\nD\nE", "A\nb\n\C\nd\nE");
        },
        '.split(/\\n/)[1]: "B" != "b"\n...',
        [
            ["A\nB\nC\nD\nE", "A\nb\n\C\nd\nE"],
            [["A", "B", "C", "D", "E"], ["A", "b", "C", "d", "E"]],
            ["A", "A"],
            ["B", "b"],
            ["C", "C"],
            ["D", "d"],
        ]);
    });
    it("call differences for each element when comparing arrays", function(){
        controlCall2Differences(function(){
            return assert.allDifferences([1], [1, null]);
        }, 
        '[1]: undefined != null', 
        [
            [[1], [1, null]],
            [1, 1],
            [undefined, null]
        ]);
    });
});

describe("many differences", function(){
    it("show many differences in a string", function(){
        assert.allDifferences.opts.maxDifferences = 3;
        expectEql(
            assert.allDifferences("1,2,3,4,5,6,7", "1, '2', 3, IV", {split:/,\s*/})
        ,
            '.split(/,\\s*/)[1]: "2" != "\'2\'"\n'+
            '.split(/,\\s*/)[3]: "4" != "IV"\n'+
            '.split(/,\\s*/)[4]: "5" != undefined\n'+
            '...'
        );
    });
    it("show many bigDifferences in a complex object", function(){
        assert.allDifferences.opts.maxDifferences = 3;
        expectEql(
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
        ,
            '.childs[0]: "Bartolomeo" != "Bart"\n'+
            '.childs[2]: "the baby" != undefined\n'+
            '.job.company: "NASA" != "the nuclear plant"\n'+
            '.job.skills: "good" != undefined\n'+
            '.job.number: undefined != "zero"\n'+
            '...'
        );
    });
});
