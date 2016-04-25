"use strict";
/*jshint eqnull:true */
/*jshint node:true */

(function codenautasModuleDefinition(root, name, factory) {
    /* global define */
    /* istanbul ignore next */
    if(typeof root.globalModuleName !== 'string'){
        root.globalModuleName = name;
    }
    /* istanbul ignore next */
    if(typeof exports === 'object' && typeof module === 'object'){
        module.exports = factory();
    }else if(typeof define === 'function' && define.amd){
        define(factory);
    }else if(typeof exports === 'object'){
        exports[root.globalModuleName] = factory();
    }else{
        root[root.globalModuleName] = factory();
    }
    root.globalModuleName = null;
})(/*jshint -W040 */this, 'selfExplain', function() {
/*jshint +W040 */

/*jshint -W004 */
var selfExplain = {};
/*jshint +W004 */

var superassert = {};

if(typeof window == "undefined"){
    var fs = require('fs');
}

selfExplain.expect = function expect(value){
    if(value===true){
        return '';
    }
    return (function(stack){
        var linea=stack.split(/\n\r?/)[2];
        var matches = linea.match(/\((.*):(\d+):(\d+)\)/);
        var fileName = matches[1];
        superassert.files = superassert.files || {};
        if(!(fileName in superassert.files)){
            var fuente = fs.readFileSync(fileName, 'utf8');
            superassert.files[fileName] = fuente;
        }else{
            fuente = superassert.files[fileName];
        }
        var lines = fuente.split(/\n\r?/);
        var numLine = matches[2];
        var errorLine = lines[numLine-1].substr(matches[3]-1);
        var errorLineParts=errorLine.match(/(\w+)s*\((.*)\)\s*\)[^)]*$/)
        var functionName=errorLineParts[1];
        var expression=errorLineParts[2];
        selfExplain.expect.log('EXPECT FAILED');
        selfExplain.expect.log(expression);
        var parts=[expression];
        var then = '';
        [ {r:/([&|]+)/g}
        , {r:/([!=<>]+)/g}
        , {r:/([+-]+)/g}
        , {r:/([*/]+)/g}
        ].forEach(function(info){
            var newParts = [].concat.apply([],parts.map(function(expression){
                return expression instanceof String?expression:expression.split(info.r).map(function(part,i){ return i % 2? new String(part): part; });
            }));
            if(parts.length!=newParts.length){
                then = functionName+'.log('+newParts.map(function(part){ return part instanceof String?'"'+part+'"':part})+');' + then;
            }
            parts=newParts;
        });
        then += 'throw new Error("expect failed in line '+numLine+'");';
        return then;
    }(new Error().stack));
};

selfExplain.expect.log = function log(){
    if(selfExplain.expect.collecting){
        selfExplain.expect.collecting.push(Array.prototype.slice.call(arguments));
    }else{
        console.log.apply(console, arguments);
    }
}

selfExplain.expect.collect = function collect(){
    selfExplain.expect.collecting=[];
}

selfExplain.expect.collected = function collected(){
    var collected = selfExplain.expect.collecting;
    selfExplain.expect.collecting = false;
    return collected;
}

return selfExplain;

});