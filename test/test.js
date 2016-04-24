"use strict";

var expect = require('expect.js');

var superExpect = require('../lib/self-explain.js').expect;

/* intentional blank area: */










































/************************************
 * this must be in line 51          *
 ************************************/

function box1(){
    var alfa = 1;
    var betha = 1;
    superExpect(alfa == betha);
}

function box2(){
    var alfa = 1;
    var betha = 2;
    superExpect(alfa == betha);
}

describe("basic operations", function(){
    it("does nothing if true", function(){
        box1();
    });
});
