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
}

function generate(AST){
    var str = escodegen.generate(AST);
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

function separateParts(previousResult){
    var result={changes:false};
    var newParts=[];
    /*eslint no-loop-func: 0*/
    /*eslint complexity: [2, 10]*/
    previousResult.parts.forEach(function(part){
        if(part.type){
            if(part.body){
                newParts = newParts.concat(part.body);
            }else if(part.arguments){
                if(part.callee.type=='Identifier'){
                    newParts.push(JSON.stringify(part.callee.name));
                }else if(part.callee.type==='FunctionExpression'){
                    newParts.push('"FunctionExpression"');
                }else{
                    parenthesis(newParts, part.callee, 'Call');
                }
                newParts.push('"("');
                newParts = newParts.concat(part.arguments);
                newParts.push('")"');
            }else if(part.expression){
                newParts.push(part.expression);
            }else if(part.right){
                parenthesis(newParts, part.left, part.operator, true);
                newParts.push(JSON.stringify(part.operator));
                parenthesis(newParts, part.right, part.operator);
            }else if(part.name){
                newParts.push(part.name);
            }else if(part.raw){
                newParts.push(part.raw);
            }else if(part.argument){
                newParts.push(JSON.stringify(part.operator));
                parenthesis(newParts, part.argument, part.operator);
            }else if(part.type==='MemberExpression' && part.computed){
                parenthesis(newParts, part.object, '.');
                newParts.push('"["');
                parenthesis(newParts, part.property, '.');
                newParts.push('"]"');
            }else if(part.type==='MemberExpression' && part.property.name){
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

selfExplain.expect = function expect(value){
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
        var errorLine = lines[numLine-1].substr(matches[3]-1);
        var errorLineParts=errorLine.match(/(\w+)s*\((.*)\)\s*\)[^)]*$/);
        var functionName=errorLineParts[1];
        var expression=errorLineParts[2];
        selfExplain.expect.log('EXPECT FAILED');
        selfExplain.expect.log(expression);
        var then = '';
        var i=99999;
        var result={changes:true, parts:[esprima.parse(expression)]};
        var showAnt='!~';
        while(i>0 && result.changes){
            i--;
            result = separateParts(result);
            /*eslint no-loop-func: 0*/
            if(showAnt!==result.show){
                then = functionName+'.log('+result.show+');' + then;
                showAnt=result.show;
            }
        }
        then += 'throw new Error("expect failed in line '+numLine+'");';
        return then;
    })(new Error().stack);
};

selfExplain.expect.log = function log(){
    if(selfExplain.expect.collecting){
        selfExplain.expect.collecting.push(Array.prototype.slice.call(arguments));
    }else{
        console.log.apply(console, arguments);
    }
};

selfExplain.expect.collect = function collect(){
    selfExplain.expect.collecting=[];
};

selfExplain.expect.collected = function collected(){
    var collected = selfExplain.expect.collecting;
    selfExplain.expect.collecting = false;
    return collected;
};

return selfExplain;

});