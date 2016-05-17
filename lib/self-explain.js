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
    var getSource=(function(){
        var fs = require('fs');
        return function(fileName){
            return fs.readFileSync(fileName, 'utf8');
        }
    })();
}else{
    var getSource=(function(){
        return function(fileUrl){
            var xhttp = new XMLHttpRequest();
            /*
            xhttp.onreadystatechange = function() {
                if (xhttp.readyState == 4 && xhttp.status == 200) {
                    return xhttp.responseText;
                }
            };
            */
            xhttp.open("GET", fileUrl, false);
            xhttp.send();
            return xhttp.responseText;
        }
    })();
}

var esprima = require('esprima');
var escodegen = require('escodegen');

var bestGlobals = require('best-globals');
var changing = bestGlobals.changing;
var date = bestGlobals.date;

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
                if(part.callee.type==='Identifier'){
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

// atencion nunca usarla con strings iguales!!
function findFirstDiffPos(s1, s2) {
    var i=0;
    //if(s1 === s2) { return -1; }
    while(s1[i] === s2[i]) { i++; }
    return i;
}

function dateStr(dt) {
    return dt.getYear()+dt.getMonth()+dt.getDay();
}

function timeStr(dt) {
    var ms = dt.getMilliseconds();
    return dt.getHours()+dt.getMinutes()+dt.getSeconds()+(ms === 0?'':ms);
}

function npad(num, width) {
    var n=num+''; // to string
    return n.length >= width ? n : new Array(width - n.length + 1).join('0') + n;
}

function toLocalISOString(dt) {
    var r = [];
    r.push(dt.getFullYear()+'-');
    r.push(npad(dt.getMonth()+1,2)+'-');
    r.push(npad(dt.getDate(),2)+' ');
    r.push(npad(dt.getHours(),2)+':');
    r.push(npad(dt.getMinutes(),2)+':');
    r.push(npad(dt.getSeconds(),2)+'.');
    r.push(npad(dt.getMilliseconds(),3));
    return r.join('');
}

selfExplain.assert = function assert(value){
    if(value===true){
        return '';
    }
    return (function(stack){
        var lineNum;
        var linea;
        var matches;
        if(!stack){
            try{
                throw new Error();
            }catch(error){
                stack = error.stack;
                //console.log('+++++++++++++ STACK', stack);
                linea=stack.split(/\n\r?/)[3];
            }
        }else{
            linea=stack.split(/\n\r?/)[2];
        }
        // console.log("stack", stack);
        matches = linea.match(/\((.*):(\d+):(\d+)\)/);
        if(!matches){
            if(window.navigator.userAgent.match(/PhantomJS\/[0-9.]+/)){
                //console.log('///////// PHANTOM');
                lineNum=2;
            }else{
                lineNum=1;
            }
            linea=stack.split(/\n\r?/)[lineNum];
            matches = linea.match(/(?:.*@)?([^@]*):(\d+):(\d+)/);
            if(!matches){
                //console.log('*****************1');
                console.log(stack);
            }
        }
        var fileName = matches[1];
        var fuente;
        superassert.files = superassert.files || {};
        if(!(fileName in superassert.files)){
            fuente = getSource(fileName);
            superassert.files[fileName] = fuente;
        }else{
            fuente = superassert.files[fileName];
        }
        var lines = fuente.split(/\n\r?/);
        var numLine = matches[2];
        var errorLine = lines[numLine-1];
        var errorLineParts=errorLine.match(/^\s+(eval\s*\()?(\w+)s*\((.*)(\))\s*\)?[^)]*$/);
        // console.log('---',errorLineParts);
        var withEval=errorLineParts[1];
        var functionName=errorLineParts[2];
        var expression=errorLineParts[3];
        if(withEval){
            expression = expression.substr(0,expression.length-1);
        }
        // console.log("expression", expression)
        // console.log("value", value)
        // if(lineNum==2){
        //     console.log('%%%%%%%%%%%%%%%%');
        //     console.log(errorLine)
        //     console.log(withEval,'///',errorLineParts.join(' // '));
        // }
        var then=[];
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
            then.push(functionName+'.log('+JSON.stringify(expression)+', "====", '+expression+');');
        }
        then.push('throw new Error("assert failed in line '+numLine+'");');
        return then.join('');
    })((new Error()).stack);
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
    var delta = opts.delta || 0;
    var format = selfExplain.assert.formatDiff;
    if(a === b){
        return null;
    }
    if(opts.autoTypeCast && a == b){
        return null;
    }
    var result = [];
    var collect = function collect(diff){
        if(!opts.maxDifferences || result.length < opts.maxDifferences){
            result.push(diff);
        }else if(result.length == opts.maxDifferences){
            result.push("...");
            return false;
        }
        return true;
    }
    var compAndCollect = function compAndCollect(index, prefix){
        var diff = selfExplain.assert.differences(a[index], b[index], opts, prefix);
        if(diff){
            return collect(diff);
        }
        return true;
    }
    if(a instanceof Array && b instanceof Array){
        for(var i=0; i<Math.max(a.length, b.length); i++){
            if(!compAndCollect(i,  prefix+"[" + (i) + "]")) break;
        }
        return result.length ? result.join("\n") : null;
    }
    if(a instanceof Date && b instanceof Date) {
        var rv = [];
        var aas = toLocalISOString(a);
        var bbs = toLocalISOString(b);
        var timesDiffer = timeStr(a) !== timeStr(b);
        var msDiff = a.getTime()-b.getTime();
        var showTimeDiff = Math.abs(msDiff) <= 359999000; // 99 * 60 * 60 * 1000 + 59 * 60 * 1000 + 59 * 1000;
        if(dateStr(a) !== dateStr(b)) {
            rv.push(aas.slice(0, 10));
            if(timesDiffer) {
                rv.push(' ');
                rv.push(aas.substr(11, a.getMilliseconds()?12:8));
            }
            rv.push(' != ');
            rv.push(bbs.slice(0, 10));
            if(timesDiffer) {
                rv.push(' ');
                rv.push(bbs.substr(11, b.getMilliseconds()?12:8));
            }
            if(showTimeDiff) { rv.push(' => '); }
        }
        if(timesDiffer && showTimeDiff) {
            var tdiff = [];
            var x = Math.abs(msDiff);
            var ms = Math.floor(x % 1000);
            x /= 1000;
            var s = Math.floor(x % 60);
            x /= 60
            var m = Math.floor(x % 60);
            x /= 60
            var h = Math.floor(x); // todas las horas
            tdiff.push((msDiff<0?'-':'')+(h<10?'0':'')+h);
            tdiff.push((m<10?'0':'')+m);
            tdiff.push((s<10?'0':'')+s);
            rv.push(tdiff.join(':'));
            if(ms>0) { rv.push('.'+ms); }
        }
        return rv.join('');
    }
    if(a instanceof Object && b instanceof Object){
        if(!opts.duckTyping && a.constructor != b.constructor){
            return ".class: "+a.constructor.name+' != '+b.constructor.name;
        }
        var result = [];
        var aKeys = Object.keys(a);
        var bKeys = Object.keys(b);
        aKeys.forEach(function(name, i){
            if(!opts.unordered && bKeys[i]!==name){
                !collect(prefix+'{'+i+'}: .'+name+' != '+(i>=bKeys.length?'undefined':'.'+bKeys[i]))
            }else{
                !compAndCollect(name,  prefix+"."+name)
            }
        });
        if(opts.unordered){
            for(var name in b){
                if(!(name in a)){
                    compAndCollect(name,  prefix+"."+name);
                }
            }
        }else{
            var i = aKeys.length;
            while(i<bKeys.length){
                !collect(prefix+'{'+i+'}: undefined != .'+bKeys[i])
                i++;
            }
        }
        return result.length ? result.join("\n") : null;
    }
    if(typeof a === "string" && typeof b === "string") {
        if(opts.split.test(a) || opts.split.test(b)) {
            return selfExplain.assert.differences(a.split(opts.split), b.split(opts.split), opts, prefix+".split(" + opts.split + ")");
        }
        var firstDiff = findFirstDiffPos(a,b);
        if(firstDiff>4) {
            var maxDiff=selfExplain.assert.allDifferences.opts.substrLengthArgument;
            return '.substr('+firstDiff+','+maxDiff+'): "'+a.substr(firstDiff, maxDiff)+'" != "'+b.substr(firstDiff,maxDiff)+'"';
        }
    }
    if(opts.autoTypeCast ? !isNaN(a) && !isNaN(b) : typeof a === "number" && typeof b === "number"){
        if(Math.abs(a-b)<delta) { return null; }
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
    duckTyping: true,
};

return selfExplain;

});