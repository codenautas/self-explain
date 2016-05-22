"use strict";

var expectError;
var expectEql;

var assert = require('../lib/self-explain.js').assert;

var changing = require('best-globals').changing;

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

/* intentional blank area: */





// 30









// 40









/************************************
 * this must be in line 51          *
 ************************************/

function box_ok(){
    var alpha = 1;
    var betha = 1;
    eval(assert(alpha == betha));
}

function box_fail_1eq2(){
    var alpha = 1;
    var betha = 2;
    eval(assert(alpha == betha));
}

function box_fail_1eq2and3neq4(){
    var alpha = 1;
    var betha = 2;
    var gamma = 3;
    var delta = 4;
    eval(assert(alpha == betha && gamma != delta));
}

function box_fail_sum_lt_mul(){
    var alpha = 2;
    var betha = 3;
    eval(assert(alpha + betha > alpha*betha));
}

function box_fail_not_parenthesis(){
    var alpha = 2;
    var betha = 3; 
    eval(assert(!(alpha + 1 == betha)));
}

function box_fail_arit_parenthesis(){
    var alpha = 2;
    var betha = 3;
    eval(assert((alpha - betha) * 2 + 2));
}

function box_fail_object(){
    var alpha = {one:{}, two:2};
    eval(assert(alpha.one.two));
}

function box_fail_array(){
    var alpha = [1, 2, '3', false];
    var betha = 3;
    eval(assert(alpha[2] == alpha["inex"] || alpha[betha]));
}

function box_function_call(){ 
    eval(assert(isNaN(0)));
}

function box_anonymous_function_call(){ 
    eval(assert((function(x){return x-1;}(1))));
}

function unbox_fail_arit_parenthesis(){
    var alpha = 2;
    var betha = 3;
    assert((alpha - betha) * 2 + 2);
}

function box_big_litterals(){ 
    eval(assert(!changing({a:7, b:[1, 2], c:9}, {a:8, b:[3], d:4}).b.length));
}

function box_global_objects(){ 
    eval(assert(new Date(2012,5,21).toString().match(/\d\d\d\d-\d\d/)));
}

if(it.demo){
    box_ok();
    var show=function(f){ 
        try{ 
            f(); 
            console.log("BAD! MUST FAIL!"); 
        }catch(err){ 
            if(/assert.*failed.*line/.test(err.message)){
                console.log('its ok to fail'); 
            }else{
                console.log('BAD ERROR',err);
                console.log(err.stack);
            }
        }
    };
    show(box_fail_1eq2);
    show(box_fail_1eq2and3neq4);
    show(box_fail_sum_lt_mul);
    show(box_fail_not_parenthesis);
    show(box_fail_arit_parenthesis);
    show(box_fail_object);
    show(box_fail_array);
    show(box_function_call);
    show(unbox_fail_arit_parenthesis);
    show(box_global_objects());
}

//////////////// TEST ////////////////

if(typeof agentInfo === 'undefined'){
    global.agentInfo={};
}

describe("basic operations ", function(){
    if(agentInfo.brief==='Safari 5.1.7' || agentInfo.brief==='IE 8.0'){
        it("basic old navigators support FOR unbox", function(){
            assert.collect();
            expectError(unbox_fail_arit_parenthesis,/assert.*failed/);
            expectEql(assert.collected(),[
                ['ASSERT FAILED'],
                ['UNKNOWN', '====', 0]
            ]);
        });
        return; 
    }
    it("inform error in unbox_fail_arit_parenthesis", function(){
        assert.collect();
        expectError(unbox_fail_arit_parenthesis, /assert.*failed.*line.*114/);
        expectEql(assert.collected(),[
            ['ASSERT FAILED'],
            ['(alpha - betha) * 2 + 2', '====', 0]
        ]);
    });
});

describe("boxed operations", function(){
    if(agentInfo.brief==='Safari 5.1.7' || agentInfo.brief==='IE 8.0'){
        it("basic old navigators support FOR boxed", function(){
            assert.collect();
            expectError(box_fail_1eq2,/assert.*failed/);
            expectEql(assert.collected(), [
                ['ASSERT FAILED'],
                ['UNKNOWN', '====', false]
            ]);
        });
        return; 
    }
    it("does nothing if true", function(){
        box_ok();
    });
    it("inform error in one simple comparison", function(){
        assert.collect();
        expectError(box_fail_1eq2,/assert.*failed.*line.*63/);
        expectEql(assert.collected(), [
            ['ASSERT FAILED'],
            ['alpha == betha','====',false],
            ['alpha','====', 1],
            ['betha','====', 2]
        ]);
    });
    it("inform error in one simple logical", function(){
        assert.collect();
        expectError(box_fail_1eq2and3neq4, /assert.*failed.*line.*71/);
        expectEql(assert.collected(), [
            ['ASSERT FAILED'],
            ['alpha == betha && gamma != delta', '====', false],
            ['alpha == betha', '====', false],
            ['gamma != delta', '====', true],
            ['alpha', '====', 1],
            ['betha', '====', 2],
            ['gamma', '====', 3],
            ['delta', '====', 4]
        ]);
    });
    it("inform error in one simple math", function(){
        assert.collect();
        expectError(box_fail_sum_lt_mul, /assert.*failed.*line.*77/);
        expectEql(assert.collected(), [
            ['ASSERT FAILED'],
            ['alpha + betha > alpha * betha', '====', false],
            ['alpha + betha', '====', 5],
            ['alpha * betha', '====', 6],
            ['alpha', '====', 2],
            ['betha', '====', 3],
        ]);
    });
    it("inform error in negated parenthesis", function(){
        assert.collect();
        expectError(box_fail_not_parenthesis, /assert.*failed.*line.*83/);
        expectEql(assert.collected(), [
            ['ASSERT FAILED'],
            ['!(alpha + 1 == betha)', '====', false],
            ['alpha + 1 == betha', '====', true],
            ['alpha + 1', '====', 3],
            ['betha', '====', 3],
            ['alpha', '====', 2],
        ]);
    });
    it("inform error in arithmetic parenthesis", function(){
        assert.collect();
        expectError(box_fail_arit_parenthesis, /assert.*failed.*line.*89/);
        expectEql(assert.collected(), [
            ['ASSERT FAILED'],
            ['(alpha - betha) * 2 + 2', '====', 0],
            ['(alpha - betha) * 2', '====', -2],
            ['alpha - betha', '====', -1],
            ['alpha', '====', 2],
            ['betha', '====', 3],
        ]);
    });
    it("inform error object expresion", function(){
        assert.collect();
        expectError(box_fail_object, /assert.*failed.*line.*94/);
        expectEql(assert.collected(), [
            ['ASSERT FAILED'],
            ['alpha.one.two', '====', undefined],
            ['alpha.one', '====', {}],
            ['alpha', '====', {one: {}, two: 2}],
        ]);
    });
    it("inform error array expresion", function(){
        assert.collect();
        expectError(box_fail_array, /assert.*failed.*line/);
        expectEql(assert.collected(), [
            ["ASSERT FAILED"],
            ["alpha[2] == alpha['inex'] || alpha[betha]", "====", false],
            ["alpha[2] == alpha['inex']", "====", false],
            ["alpha[betha]", "====", false],
            ["alpha[2]", "====", 3],
            ["alpha['inex']", "====", undefined],
            ["alpha", "====", [1,2,'3', false]],
            ["betha", "====", 3],
        ]);
    });
    it("inform error function call", function(){
        assert.collect();
        expectError(box_function_call, /assert.*failed.*line/);
        expectEql(assert.collected(), [
            ['ASSERT FAILED'],
            ['isNaN(0)', '====', false],
        ]);
    });
    it("inform error anonymous function call", function(){
        /*
        selfExplain.assert.setOptions({escodegen:{
            format: {
                indent: {
                    style: '',
                    base: 0,
                    adjustMultilineComment: false
                },
                newline: '',
            }
        }});
        */
        assert.collect();
        expectError(box_anonymous_function_call, /assert.*failed.*line/);
        expectEql(assert.collected(), [
            ['ASSERT FAILED'],
            ['function (x) {return x - 1;}(1)', '====', 0],
        ]);
    });
    it("inform error in object expression", function(){
        assert.collect();
        expectError(box_big_litterals, /assert.*failed.*line/);
        var expected=[
            ['ASSERT FAILED'],
            ['!changing({a: 7,b: [1,2],c: 9}, {a: 8,b: [3],d: 4}).b.length', '====', false],
            ['changing({a: 7,b: [1,2],c: 9}, {a: 8,b: [3],d: 4}).b.length', '====', 1],
            ['changing({a: 7,b: [1,2],c: 9}, {a: 8,b: [3],d: 4}).b', '====', [3]],
            ['changing({a: 7,b: [1,2],c: 9}, {a: 8,b: [3],d: 4})', '====', {a: 8,b: [3],c: 9,d: 4}],
        ];
        var obtained=assert.collected();
        // expect(assert.allDifferences(obtained, expected)).to.eql(null);
        expectEql(obtained, expected);
    });
    it("inform error in global objects", function(){
        assert.collect();
        expectError(box_global_objects, /assert.*failed.*line/);
        var expected=[
            ['ASSERT FAILED'],
            ['new Date(2012, 5, 21).toString().match(/\\d\\d\\d\\d-\\d\\d/)', '====', null],
            // ['new Date(2012, 5, 21).toString().match', '====', String.prototype.match],
            ['new Date(2012, 5, 21).toString()', '====', new Date(2012, 5, 21).toString()],
            // ['new Date(2012, 5, 21).toString', '====', Date.prototype.toString],
            ['new Date(2012, 5, 21)', '====', new Date(2012, 5, 21)],
        ];
        var obtained=assert.collected();
        // expect(assert.allDifferences(obtained, expected)).to.eql(null);
        expectEql(obtained, expected);
    });
});
