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

/* istanbul ignore next */
if(typeof window === "undefined"){
    /*eslint global-require: 0*/
    var fs = require('fs');
    var esprima = require('esprima');
    var escodegen = require('escodegen');
    
    var changing = require('best-globals').changing;
}

var escodegen_opts={};

function generate(AST){
    var str = escodegen.generate(AST, escodegen_opts);
    if(str[str.length-1]===';'){
        return str.substr(0,str.length-1);
    }
    return str;
}

var Precedence = {
    Sequence: 0,
    Yield: 1,
    Await: 1,
    Assignment: 1,
    Conditional: 2,
    ArrowFunction: 2,
    LogicalOR: 3,
    LogicalAND: 4,
    BitwiseOR: 5,
    BitwiseXOR: 6,
    BitwiseAND: 7,
    Equality: 8,
    Relational: 9,
    BitwiseSHIFT: 10,
    Additive: 11,
    Multiplicative: 12,
    Unary: 13,
    Postfix: 14,
    Call: 15,
    New: 16,
    TaggedTemplate: 17,
    Member: 18,
    Primary: 19
};

var BinaryPrecedence = {
    '||': Precedence.LogicalOR,
    '&&': Precedence.LogicalAND,
    '|': Precedence.BitwiseOR,
    '^': Precedence.BitwiseXOR,
    '&': Precedence.BitwiseAND,
    '==': Precedence.Equality,
    '!=': Precedence.Equality,
    '===': Precedence.Equality,
    '!==': Precedence.Equality,
    'is': Precedence.Equality,
    'isnt': Precedence.Equality,
    '<': Precedence.Relational,
    '>': Precedence.Relational,
    '<=': Precedence.Relational,
    '>=': Precedence.Relational,
    'in': Precedence.Relational,
    'instanceof': Precedence.Relational,
    '<<': Precedence.BitwiseSHIFT,
    '>>': Precedence.BitwiseSHIFT,
    '>>>': Precedence.BitwiseSHIFT,
    '+': Precedence.Additive,
    '-': Precedence.Additive,
    '*': Precedence.Multiplicative,
    '%': Precedence.Multiplicative,
    '/': Precedence.Multiplicative,
    // other:
    '!': Precedence.Unary,
    '.': Precedence.Member,
    'Call': Precedence.Call,
};
    
function parenthesis(list, expression, fatherOperator){
    var withParenthesis=expression.operator && BinaryPrecedence[expression.operator] < BinaryPrecedence[fatherOperator];
    if(withParenthesis){
        list.push('"("');
    }
    list.push(expression);
    if(withParenthesis){
        list.push('")"');
    }
}

function separateParts(previousResult, expressions){
    var result={changes:false};
    var newParts=[];
    var register=function(part){
        var expression = generate(part);
        if(!expressions[expression]){
            expressions[expression]=true;
        }
    }
    /*eslint no-loop-func: 0*/
    /*eslint complexity: [2, 10]*/
    previousResult.parts.forEach(function(part){
        if(part.type){
            if(part.body){
                newParts = newParts.concat(part.body);
                // register(part);
            }else if(part.arguments){
                register(part);
                if(part.callee.type=='Identifier'){
                    newParts.push(JSON.stringify(part.callee.name));
                }else if(part.callee.type==='FunctionExpression'){
                    newParts.push('"FunctionExpression"');
                }else{
                    // Not expand function expressions:
                    // parenthesis(newParts, part.callee, 'Call');
                }
                newParts.push('"("');
                newParts = newParts.concat(part.arguments);
                newParts.push('")"');
            }else if(part.expression){
                // register(part);
                newParts.push(part.expression);
            }else if(part.right){
                register(part);
                parenthesis(newParts, part.left, part.operator, true);
                newParts.push(JSON.stringify(part.operator));
                parenthesis(newParts, part.right, part.operator);
            }else if(part.name){
                register(part);
                newParts.push(part.name);
            }else if(part.raw){
                newParts.push(part.raw);
            }else if(part.argument){
                register(part);
                newParts.push(JSON.stringify(part.operator));
                parenthesis(newParts, part.argument, part.operator);
            }else if(part.key){
                newParts.push(JSON.stringify(part.key.name));
                newParts.push('":"');
                newParts.push(part.value);
                newParts.push('"}"');
            }else if(part.properties){
                register(part);
                newParts.push('"{"');
                part.properties.forEach(function(part){
                    newParts.push(part);
                });
                newParts.push('"}"');
            }else if(part.elements){
                register(part);
                newParts.push('"["');
                part.elements.forEach(function(part){
                    newParts.push(part);
                });
                newParts.push('"]"');
            }else if(part.type==='MemberExpression' && part.computed){
                register(part);
                parenthesis(newParts, part.object, '.');
                newParts.push('"["');
                parenthesis(newParts, part.property, '.');
                newParts.push('"]"');
            }else if(part.type==='MemberExpression' && part.property.name){
                register(part);
                parenthesis(newParts, part.object, '.');
                newParts.push('"."');
                newParts.push(JSON.stringify(part.property.name));
            }else{
                console.log("self-explain internal ERROR");
                console.log(part);
                throw new Error("self-explain internal ERROR");
            }
            result.changes=true;
        }else{
            newParts.push(part);
        }
    });
    result.parts = newParts;
    var exprs=result.parts.map(function(part){
        return part.type?generate(part):part;
    });
    result.show=exprs.join(',');
    return result;
}

selfExplain.assert = function assert(value){
    if(value===true){
        return '';
    }
    return (function(stack){
        var linea=stack.split(/\n\r?/)[2];
        var matches = linea.match(/\((.*):(\d+):(\d+)\)/);
        var fileName = matches[1];
        var fuente;
        superassert.files = superassert.files || {};
        if(!(fileName in superassert.files)){
            fuente = fs.readFileSync(fileName, 'utf8');
            superassert.files[fileName] = fuente;
        }else{
            fuente = superassert.files[fileName];
        }
        var lines = fuente.split(/\n\r?/);
        var numLine = matches[2];
        var errorLineFromPosition = lines[numLine-1].substr(matches[3]-1);
        var errorLinePrePosition = lines[numLine-1].substr(0,matches[3]-1);
        var withEval=errorLinePrePosition.match(/eval\s*./)
        if(withEval){
            var errorLineParts=errorLineFromPosition.match(/(\w+)s*\((.*)\)\s*\)[^)]*$/);
        }else{
            var errorLineParts=errorLineFromPosition.match(/(\w+)s*\((.*)\)[^)]*$/);
        }
        var functionName=errorLineParts[1];
        var expression=errorLineParts[2];
        var then = '';
        var expressions={};
        selfExplain.assert.log('ASSERT FAILED');
        if(!withEval){
            selfExplain.assert.log(expression, '====', value);
            throw new Error("assert failed in line "+numLine);
        }
        var i=99999;
        var result={changes:true, parts:[esprima.parse(expression)]};
        var showAnt='!~';
        while(i>0 && result.changes){
            i--;
            result = separateParts(result, expressions);
            /*eslint no-loop-func: 0*/
        }
        for(var expression in expressions){
            then += functionName+'.log('+JSON.stringify(expression)+', "====", '+expression+');';
        }
        then += 'throw new Error("assert failed in line '+numLine+'");';
        return then;
    })(new Error().stack);
};

selfExplain.assert.log = function log(){
    if(selfExplain.assert.collecting){
        selfExplain.assert.collecting.push(Array.prototype.slice.call(arguments));
    }else{
        console.log.apply(console, arguments);
    }
};

selfExplain.assert.collect = function collect(){
    selfExplain.assert.collecting=[];
};

selfExplain.assert.collected = function collected(){
    var collected = selfExplain.assert.collecting;
    selfExplain.assert.collecting = false;
    return collected;
};

selfExplain.assert.setOptions = function setOptions(opts){
    selfExplain.assert.opts = opts;
    escodegen_opts = opts.escodegen;
};

selfExplain.assert.opts = {showMode: 'expressions'};

selfExplain.assert.formatDiff = function formatDiff(diff, prefix){
    return prefix ? prefix+': '+diff : diff;
}

selfExplain.assert.differences = function differences(a, b, opts, prefix){
    opts = opts || {};
    prefix = prefix || '';
    var format = selfExplain.assert.formatDiff;
    if(a === b){
        return null;
    }
    if(opts.autoTypeCast && a == b){
        return null;
    }
    var result = [];
    var collect = function collect(diff, prefix){
        if(!opts.maxDifferences || result.length < opts.maxDifferences){
            result.push(format(diff, prefix));
        }else if(result.length == opts.maxDifferences){
            result.push("...");
            return false;
        }
        return true;
    }
    var compAndCollect = function compAndCollect(index, prefix){
        var diff = selfExplain.assert.differences(a[index], b[index], opts);
        if(diff){
            return collect(diff, prefix);
        }
        return true;
    }
    if(a instanceof Array && b instanceof Array){
        for(var i=0; i<Math.max(a.length, b.length); i++){
            if(!compAndCollect(i,  prefix+"[" + (i) + "]")) break;
        }
        return result.length ? result.join("\n") : null;
    }
    if(a instanceof Object && b instanceof Object){
        var result = [];
        var aKeys = Object.keys(a);
        var bKeys = Object.keys(b);
        var i=0;
        for(var name in a){
            if(!opts.unordered && bKeys[i]!==name){
                if(!collect('.'+name+' != '+(i>=bKeys.length?'undefined':'.'+bKeys[i]), prefix+'{'+i+'}')) break;
            }else{
                if(!compAndCollect(name,  prefix+"."+name)) break;
            }
            i++;
        }
        if(opts.unordered){
            for(var name in b){
                if(!(name in a)){
                    compAndCollect(name,  prefix+"."+name);
                }
            }
        }else{
            while(i<bKeys.length){
                if(!collect('undefined != .'+bKeys[i], prefix+'{'+i+'}')) break;
                i++;
            }
        }
        return result.length ? result.join("\n") : null;
    }
    if(typeof a === "string" && typeof b === "string" && (opts.split.test(a) || opts.split.test(b))){
        return selfExplain.assert.differences(a.split(opts.split), b.split(opts.split), opts, prefix+".split(" + opts.split + ")");
    }
    if(opts.autoTypeCast ? !isNaN(a) && !isNaN(b) : typeof a === "number" && typeof b === "number"){
        return format(a-b, prefix);
    }
    return format(JSON.stringify(a)+' != '+JSON.stringify(b), prefix);
}

selfExplain.assert.allDifferences = function allDifferences(a,b,opts){
    return selfExplain.assert.differences(a, b, changing(selfExplain.assert.allDifferences.opts, opts||{}));
}

selfExplain.assert.allDifferences.opts = {
    minLengthToSubstr: 16,
    substrLengthArgument: 10,
    split: /\n/,
    maxDifferences: 10,
}

selfExplain.assert.bigDifferences = function bigDifferences(a,b){
    return selfExplain.assert.differences(a, b, changing(
        selfExplain.assert.allDifferences.opts, selfExplain.assert.bigDifferences.opts
    ));
}

selfExplain.assert.bigDifferences.opts = {
    autoTypeCast:true,
    delta:0.00000001,
    split: /\r?\n/,
    unordered: true,
};

return selfExplain;

});