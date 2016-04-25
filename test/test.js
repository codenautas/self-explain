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

if(it.demo){
    box_ok();
    // box_fail_1eq2();
    var show=function(f){ try{ f(); console.log("BAD! MUST FAIL!"); }catch(err){ console.log('its ok to fail'); }};
    show(box_fail_1eq2);
    show(box_fail_1eq2and3neq4);
    show(box_fail_sum_lt_mul);
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
    it("inform error in one simple expression", function(){
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
    it("inform error in one simple expression", function(){
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
});
