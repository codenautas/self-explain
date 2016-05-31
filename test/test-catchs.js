"use strict";

var expectError;
var expectEql;

var assert = require('../lib/self-explain.js').assert;
var assertCatch = require('../lib/self-explain.js').assertCatch;

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
    expectError=function(x,re){ try{x(); throw new Error("Error expected"); }catch(err){ 
        console.log(err.message)
        eval(assert(re.test(err.message))); 
    } };
};
with_expect();
// with_self_explain();

describe("assertCatch", function(){
    it("show if function no throws error", function(){
        expectError(function(){
            assertCatch(function(){
                return new Error('not thrown');
            },/this error/);
        },/function does not throws any error.*this error.*expected/);
    });
    it("show if function throws another error", function(){
        expectError(function(){
            assertCatch(function(){
                throw new Error('other error');
            },/this error/);
        },/this error expected other error obtained/);
    });
    it("accept the correct error", function(){
        assertCatch(function(){
            throw new Error('this error');
        },/this error/);
    });
});