"use strict";

var expect = require('expect.js');
var sinon = require('sinon');

var selfExplain = require('../lib/self-explain.js');
var assert = selfExplain.assert;

/* intentional blank area: */
// 10









// 20









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
}

//////////////// TEST ////////////////

describe("basic operations ", function(){
    it("inform error in unbox_fail_arit_parenthesis", function(){
        assert.collect();
        expect(unbox_fail_arit_parenthesis).to.throwError(/assert.*failed.*line.*114/);
        expect(assert.collected()).to.eql([
            ['ASSERT FAILED'],
            ['(alpha - betha) * 2 + 2', '====', 0]
        ]);
    });
});

[
    {opts:{showMode:'subexpressions'}},
    {opts:{showMode:'resolving'}},
].forEach(function(info){
    describe("boxed operations "+JSON.stringify(info), function(){
        before(function(){
            assert.setOptions(info.opts);
        });
        it("does nothing if true", function(){
            box_ok();
        });
        it("inform error in one simple comparison", function(){
            assert.collect();
            expect(box_fail_1eq2).to.throwError(/assert.*failed.*line.*63/);
            if(info.opts.showMode==='resolving'){
                expect(assert.collected()).to.eql([
                    ['ASSERT FAILED'],
                    ['alpha == betha'],
                    [1, '==', 2],
                    [false]
                ]);
            }else{
                expect(assert.collected()).to.eql([
                    ['ASSERT FAILED'],
                    ['alpha == betha','====',false],
                    ['alpha','====', 1],
                    ['betha','====', 2]
                ]);
            }
        });
        it("inform error in one simple logical", function(){
            assert.collect();
            expect(box_fail_1eq2and3neq4).to.throwError(/assert.*failed.*line.*71/);
            if(info.opts.showMode==='resolving'){
                expect(assert.collected()).to.eql([
                    ['ASSERT FAILED'],
                    ['alpha == betha && gamma != delta'],
                    [1, '==', 2, '&&', 3, '!=', 4],
                    [false, '&&', true],
                    [false]
                ]);
            }else{
                expect(assert.collected()).to.eql([
                    ['ASSERT FAILED'],
                    ['alpha == betha && gamma != delta', '====', false],
                    ['alpha == betha', '====', false],
                    ['gamma != delta', '====', true],
                    ['alpha', '====', 1],
                    ['betha', '====', 2],
                    ['gamma', '====', 3],
                    ['delta', '====', 4]
                ]);
            }
        });
        it("inform error in one simple math", function(){
            assert.collect();
            expect(box_fail_sum_lt_mul).to.throwError(/assert.*failed.*line.*77/);
            if(info.opts.showMode==='resolving'){
                expect(assert.collected()).to.eql([
                    ['ASSERT FAILED'],
                    ['alpha + betha > alpha*betha'],
                    [2,'+', 3, '>', 2, '*', 3],
                    [5, '>', 6],
                    [false]
                ]);
            }else{
                expect(assert.collected()).to.eql([
                    ['ASSERT FAILED'],
                    ['alpha + betha > alpha * betha', '====', false],
                    ['alpha + betha', '====', 5],
                    ['alpha * betha', '====', 6],
                    ['alpha', '====', 2],
                    ['betha', '====', 3],
                ]);
            }
        });
        it("inform error in negated parenthesis", function(){
            assert.collect();
            expect(box_fail_not_parenthesis).to.throwError(/assert.*failed.*line.*83/);
            if(info.opts.showMode==='resolving'){
                expect(assert.collected()).to.eql([
                    ['ASSERT FAILED'],
                    ['!(alpha + 1 == betha)'],
                    ['!','(', 2,'+', 1, '==', 3, ')'],
                    ['!','(', 3, '==', 3, ')'],
                    ['!', '(', true, ')'],
                    [false]
                ]);
            }
        });
        it("inform error in arithmetic parenthesis", function(){
            assert.collect();
            expect(box_fail_arit_parenthesis).to.throwError(/assert.*failed.*line.*89/);
            if(info.opts.showMode==='resolving'){
                expect(assert.collected()).to.eql([
                    ['ASSERT FAILED'],
                    ['(alpha - betha) * 2 + 2'],
                    ['(', 2,'-', 3, ')', '*', 2, '+', 2],
                    ['(', -1, ')', '*', 2, '+', 2],
                    [-2, '+', 2],
                    [0]
                ]);
            }else{
                expect(assert.collected()).to.eql([
                    ['ASSERT FAILED'],
                    ['(alpha - betha) * 2 + 2', '====', 0],
                    ['(alpha - betha) * 2', '====', -2],
                    ['alpha - betha', '====', -1],
                    ['alpha', '====', 2],
                    ['betha', '====', 3],
                ]);
            }
        });
        it("inform error object expresion", function(){
            assert.collect();
            expect(box_fail_object).to.throwError(/assert.*failed.*line.*94/);
            if(info.opts.showMode==='resolving'){
                expect(assert.collected()).to.eql([
                    ['ASSERT FAILED'],
                    ['alpha.one.two'],
                    [{ one: {}, two: 2 }, '.', 'one', '.', 'two'],
                    [{}, '.', 'two'],
                    [undefined]
                ]);
            }else{
                expect(assert.collected()).to.eql([
                    ['ASSERT FAILED'],
                    ['alpha.one.two', '====', undefined],
                    ['alpha.one', '====', {}],
                    ['alpha', '====', {one: {}, two: 2}],
                ]);
            }
        });
        it("inform error array expresion", function(){
            assert.collect();
            expect(box_fail_array).to.throwError(/assert.*failed.*line/);
            if(info.opts.showMode==='resolving'){
                expect(assert.collected()).to.eql([
                    ['ASSERT FAILED'],
                    ['alpha[2] == alpha["inex"] || alpha[betha]'],
                    [[1,2,"3", false], "[", 2, "]", "==", [1,2,"3", false], "[", "inex", "]", "||", [1,2,"3", false], "[", 3, "]"],
                    /* acá hay dos líneas que son iguales, sería ideal que no aparezcan. 
                       Internamente los valores que producen la expresión "inex" usan comillas distintas.
                    */
                    [[1,2,"3", false], "[", 2, "]", "==", [1,2,"3", false], "[", "inex", "]", "||", [1,2,"3", false], "[", 3, "]"],
                    ["3", "==", undefined, "||", [1,2,"3", false], "[", 3, "]"],
                    [false, "||", false],
                    [false]
                ]);
            }else{
                expect(assert.collected()).to.eql([
                    ["ASSERT FAILED"],
                    ["alpha[2] == alpha['inex'] || alpha[betha]", "====", false],
                    ["alpha[2] == alpha['inex']", "====", false],
                    ["alpha[betha]", "====", false],
                    ["alpha[2]", "====", 3],
                    ["alpha['inex']", "====", undefined],
                    ["alpha", "====", [1,2,'3', false]],
                    ["betha", "====", 3],
                ]);
            }
        });
        it("inform error function call", function(){
            assert.collect();
            expect(box_function_call).to.throwError(/assert.*failed.*line/);
            if(info.opts.showMode==='resolving'){
                expect(assert.collected()).to.eql([
                    ['ASSERT FAILED'],
                    ['isNaN(0)'],
                    ['isNaN','(',0,')'],
                    [false]
                ]);
            }else{
                expect(assert.collected()).to.eql([
                    ['ASSERT FAILED'],
                    ['isNaN(0)', '====', false],
                ]);
            }
        });
        it("inform error function call", function(){
            assert.collect();
            expect(box_anonymous_function_call).to.throwError(/assert.*failed.*line/);
            if(info.opts.showMode==='resolving'){
                expect(assert.collected()).to.eql([
                    ['ASSERT FAILED'],
                    ['(function(x){return x-1;}(1))'],
                    ['FunctionExpression','(',1,')'],
                    [0], // no es lo ideal este doble cero
                    [0],
                ]);
            }else{
                expect(assert.collected()).to.eql([
                    ['ASSERT FAILED'],
                    ['(function (x) {\n    return x - 1;\n}(1))', '====', 0],
                    ['function (x) {\n    return x - 1;\n}(1)', '====', 0],
                ]);
            }
        });
    });
});
