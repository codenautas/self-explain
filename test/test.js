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

if(it.demo){
    box_ok();
    try{
        box_fail_1eq2();
    }catch(err){
        console.log('its ok to fail');
    };
}

//////////////// TEST ////////////////

describe("basic operations", function(){
    it("does nothing if true", function(){
        box_ok();
    });
    it("inform error in one variable", function(){
        superExpect.collect();
        expect(box_fail_1eq2).to.throwError(/expect.*failed.*line.*63/);
        expect(superExpect.collected()).to.eql([
            ['expect', 'alfa == betha', 'to be thrully'],
            [1, '==', 2]
        ]);
    });
});
