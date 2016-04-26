"use strict";

var expect = require('expect.js');
var sinon = require('sinon');

var superExpect = require('../lib/self-explain.js').expect;

/* intentional blank area: */

// 10









// 20









// 30









// 40









/************************************
 * this must be in line 51          *
 ************************************/

function box_ok(){
    var alfa = 1;
    var betha = 1;
    eval(superExpect(alfa == betha));
}

function box_fail_1eq2(){
    var alfa = 1;
    var betha = 2;
    eval(superExpect(alfa == betha));
}

function box_fail_1eq2and3neq4(){
    var alfa = 1;
    var betha = 2;
    var gamma = 3;
    var delta = 4;
    eval(superExpect(alfa == betha && gamma != delta));
}

function box_fail_sum_lt_mul(){
    var alfa = 2;
    var betha = 3;
    eval(superExpect(alfa + betha > alfa*betha));
}

function box_fail_not_parenthesis(){
    var alfa = 2;
    var betha = 3; 
    eval(superExpect(!(alfa + 1 == betha)));
}

function box_fail_arit_parenthesis(){
    var alfa = 2;
    var betha = 3;
    eval(superExpect((alfa - betha) * 2 + 2));
}

function box_fail_object(){
    var alpha = {one:{}, two:2};
    eval(superExpect(alpha.one.two));
}

function box_fail_array(){
    var alpha = [1, 2, '3', false];
    var betha = 3;
    eval(superExpect(alpha[2] == alpha["inex"] || alpha[betha]));
}

function box_function_call(){ 
    eval(superExpect(isNaN(0)));
}

function box_anonymous_function_call(){ 
    eval(superExpect((function(x){return x-1;})(1)));
}

if(it.demo){
    box_ok();
    var show=function(f){ 
        try{ 
            f(); 
            console.log("BAD! MUST FAIL!"); 
        }catch(err){ 
            if(/expect.*failed.*line/.test(err.message)){
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

describe("basic operations", function(){
    it("does nothing if true", function(){
        box_ok();
    });
    it("inform error in one simple comparison", function(){
        superExpect.collect();
        expect(box_fail_1eq2).to.throwError(/expect.*failed.*line.*63/);
        expect(superExpect.collected()).to.eql([
            ['EXPECT FAILED'],
            ['alfa == betha'],
            [1, '==', 2],
            [false]
        ]);
    });
    it("inform error in one simple logical", function(){
        superExpect.collect();
        expect(box_fail_1eq2and3neq4).to.throwError(/expect.*failed.*line.*71/);
        expect(superExpect.collected()).to.eql([
            ['EXPECT FAILED'],
            ['alfa == betha && gamma != delta'],
            [1, '==', 2, '&&', 3, '!=', 4],
            [false, '&&', true],
            [false]
        ]);
    });
    it("inform error in one simple math", function(){
        superExpect.collect();
        expect(box_fail_sum_lt_mul).to.throwError(/expect.*failed.*line.*77/);
        expect(superExpect.collected()).to.eql([
            ['EXPECT FAILED'],
            ['alfa + betha > alfa*betha'],
            [2,'+', 3, '>', 2, '*', 3],
            [5, '>', 6],
            [false]
        ]);
    });
    it("inform error in negated parenthesis", function(){
        superExpect.collect();
        expect(box_fail_not_parenthesis).to.throwError(/expect.*failed.*line.*83/);
        expect(superExpect.collected()).to.eql([
            ['EXPECT FAILED'],
            ['!(alfa + 1 == betha)'],
            ['!','(', 2,'+', 1, '==', 3, ')'],
            ['!','(', 3, '==', 3, ')'],
            ['!', '(', true, ')'],
            [false]
        ]);
    });
    it("inform error in arithmetic parenthesis", function(){
        superExpect.collect();
        expect(box_fail_arit_parenthesis).to.throwError(/expect.*failed.*line.*89/);
        expect(superExpect.collected()).to.eql([
            ['EXPECT FAILED'],
            ['(alfa - betha) * 2 + 2'],
            ['(', 2,'-', 3, ')', '*', 2, '+', 2],
            ['(', -1, ')', '*', 2, '+', 2],
            [-2, '+', 2],
            [0]
        ]);
    });
    it("inform error object expresion", function(){
        superExpect.collect();
        expect(box_fail_object).to.throwError(/expect.*failed.*line.*94/);
        expect(superExpect.collected()).to.eql([
            ['EXPECT FAILED'],
            ['alpha.one.two'],
            [{ one: {}, two: 2 }, '.', 'one', '.', 'two'],
            [{}, '.', 'two'],
            [undefined]
        ]);
    });
    it("inform error array expresion", function(){
        superExpect.collect();
        expect(box_fail_array).to.throwError(/expect.*failed.*line/);
        expect(superExpect.collected()).to.eql([
            ['EXPECT FAILED'],
            ['alpha[2] == alpha["inex"] || alpha[betha]'],
            [[1,2,"3", false], "[", 2, "]", "==", [1,2,"3", false], "[", "inex", "]", "||", [1,2,"3", false], "[", 3, "]"],
            /* acá hay dos líneas que son iguales, sería ideal que no aparezcan. 
               Internamente los valores que producen la expresión "inex" usan comillas distintas.
            */
            [[1,2,"3", false], "[", 2, "]", "==", [1,2,"3", false], "[", "inex", "]", "||", [1,2,"3", false], "[", 3, "]"],
            ["3", "==", undefined, "||", [1,2,"3", false], "[", 3, "]"],
            [false, "||", 0],
            [0]
        ]);
    });
    it("inform error function call", function(){
        superExpect.collect();
        expect(box_function_call).to.throwError(/expect.*failed.*line/);
        expect(superExpect.collected()).to.eql([
            ['EXPECT FAILED'],
            ['isNaN(0)'],
            ['isNaN','(',0,')'],
            [false]
        ]);
    });
    it("inform error function call", function(){
        superExpect.collect();
        expect(box_anonymous_function_call).to.throwError(/expect.*failed.*line/);
        expect(superExpect.collected()).to.eql([
            ['EXPECT FAILED'],
            ['(function(x){return x-1;})(1)'],
            ['FunctionExpression','(',1,')'],
            [0], // no es lo ideal este doble cero
            [0],
        ]);
    });
});
