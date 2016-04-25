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
    var esprima = require('esprima');
    var escodegen = require('escodegen');
}

function generate(AST){
    var str = escodegen.generate(AST);
    if(str[str.length-1]===';'){
        return str.substr(0,str.length-1);
    }
    return str;
}

var nodesInfo={};

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
        var parts=[esprima.parse(expression)];
        var then = '';
        var i=12;
        var changes=true;
        var showAnt='!~'
        while(i>0 && changes){
            changes=false;
            i--;
            console.log('----',parts);
            var newParts=[];
            parts.forEach(function(part){
                if(part.type){
                    var nodeInfo = nodesInfo[part.type];
                    if(part.body){
                        newParts = newParts.concat(part.body);
                    }else if(part.expression){
                        newParts.push(part.expression);
                    }else if(part.operator){
                        newParts.push(part.left);
                        newParts.push(JSON.stringify(part.operator));
                        newParts.push(part.right);
                    }else if(part.name){
                        newParts.push(part.name);
                    }
                    changes=true;
                }else{
                    newParts.push(part);
                }
            });
            parts=newParts;
            var exprs=parts.map(function(part){
                return part.type?generate(part):part;
            });
            var showPart=exprs.join(',');
            if(showAnt!=showPart){
                console.log('$$$$',exprs);
                then = functionName+'.log('+showPart+');' + then;
                showAnt=showPart;
            }
        }
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