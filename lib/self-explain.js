"use strict";

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

var getSource;
/* istanbul ignore next */
if(typeof window === "undefined"){
    /*eslint global-require: 0*/
    getSource=(function(){
        var fs = require('fs');
        return function(fileName){
            return fs.readFileSync(fileName, 'utf8');
        };
    })();
}else{
    getSource=(function(){
        return function(fileUrl){
            var xhttp;
            if(window.XMLHttpRequest){
                xhttp = new XMLHttpRequest();
            }else{
                xhttp = new ActiveXObject("MSXML2.XMLHTTP.3.0");
            }
            xhttp.open("GET", fileUrl, false);
            xhttp.send();
            return xhttp.responseText;
        };
    })();
}

var esprima = require('esprima');
var escodegen = require('escodegen');

var bestGlobals = require('best-globals');
var changing = bestGlobals.changing;
var datetime = bestGlobals.datetime;
var timeInterval = bestGlobals.timeInterval;
var constructorName = bestGlobals.constructorName;

var escodegen_opts_def={ // https://github.com/estools/escodegen/wiki/API#options
    format: {
        indent: {
            style: '',
            base: 0,
            adjustMultilineComment: false
        },
        newline: '',
    }
}; 

var escodegen_opts = escodegen_opts_def;

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

var nodeTypes={
    ArrayExpression:{
        register:true,
        childProperties:[
            {sign: '['},
            {list: 'elements'},
            {sign: ']'},
        ]
    },
    BinaryExpression:{
        register:true,
        childProperties:[
            {node: 'left', left:true},
            {operator: 'operator'},
            {node: 'right'},
        ]
    },
    CallExpression:{
        register:true,
        childProperties:[
            {name: 'callee', node:'callee', changing:{skipRegister:true}},
            {list: 'arguments'}
        ]
    },
    ExpressionStatement:{
        childProperties:[
            {onlyNode: 'expression'}
        ]
    },
    FunctionExpression:{
        // register:true,
        childProperties:[
            {sign: 'FunctionExpression'}
        ]
    },
    Identifier:{
        register:true,
        childProperties:[
            {onlyNode: 'name'}
        ]
    },
    Literal:{
        // register:true,
        childProperties:[
            {value: 'raw'}
        ]
    },
    MemberExpression:{
        register:true,
        childProperties:[
            {node: 'object', punctuator:'.'},
            {sign: '.'},
            {name: 'property'},
        ]
    },
    "MemberExpression-computed":{
        register:true,
        childProperties:[
            {node: 'object', punctuator:'.'},
            {sign: '['},
            {node: 'property', punctuator:'.'},
            {sign: ']'},
        ]
    },
    NewExpression:{
        register:true,
        childProperties:[
            {name: 'callee'},
            {list: 'arguments'}
        ]
    },
    ObjectExpression:{
        // register:true,
        childProperties:[
            {sign: '\u007b'},
            {list: 'properties'},
            {sign: '\u007d'},
        ]
    },
    Program:{
        // register:true,
        childProperties:[
            {list: 'body'}
        ]
    },
    Property:{
        childProperties:[
            {name: 'key'},
            {sign: '\u007b'},
        ]
        //kind: 'init', method: false, shorthand: false
    },
    UnaryExpression:{
        register:true,
        childProperties:[
            {operator: 'operator'},
            {node: 'argument'},
        ]
    },
};

nodeTypes.LogicalExpression=nodeTypes.BinaryExpression;

function separateParts(previousResult, expressions){
    var result={changes:false};
    var newParts=[];
    var registerNewNode=function(part){
        // console.log('pre generate',part);
        var expression = generate(part);
        // console.log('post generate',expression);
        if(!expressions[expression] && expression!=='assert'){
            expressions[expression]={};
            return {};
        }
        return false; //not new node
    };
    /*eslint no-loop-func: 0*/
    /*eslint complexity: [2, 10]*/
    previousResult.parts.forEach(function(part){
        // console.log('part-------',part.type||part);
        // console.log(part);
        if(part.type){
            // var newNode;
            var nodeDef = nodeTypes[part.type+(part.computed?'-computed':'')];
            if(!nodeDef){
                console.log("NOT CONTEMPLED");
                console.log(part);
            }
            nodeDef.childProperties.forEach(function(childProperty){
                if(nodeDef.register && !part.skipRegister){
                    registerNewNode(part);
                }
                if(childProperty.list){
                    newParts = newParts.concat(part[childProperty.list]);
                }else if(childProperty.name && (part[childProperty.name].name || part[childProperty.name].value)){
                    newParts.push(JSON.stringify((part[childProperty.name].name || part[childProperty.name].value)));
                }else if(childProperty.onlyNode){
                    newParts.push(part[childProperty.onlyNode]);
                }else if(childProperty.node){
                    var child = changing(part[childProperty.node], childProperty.changing||{}, changing.options({mostlyPlain:true}));
                    parenthesis(newParts, child, childProperty.punctuator||part[childProperty.operator], !!childProperty.left);
                }else if(childProperty.sign){
                    newParts.push(JSON.stringify(childProperty.sign));
                }else if(childProperty.operator){
                    newParts.push(JSON.stringify(part[childProperty.operator]));
                }else if(childProperty.value){
                    newParts.push(part[childProperty.value]);
                }else{
                    console.log(part);
                    console.log(childProperty);
                    throw new Error("dont know "+part.type);
                }
            });
            result.changes=true;
        }else{
            newParts.push(part);
        }
        //console.log(newParts);
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

function timeStr(dt) { return datetime.ms(dt).toYmdHmsM().substr(11); }

function getErrorBlock(lines, startLine) {
    var firstLine = lines[startLine];
    var isMultiLine = firstLine.match(/((eval\()?assert\(\r?)$/);
    if(!isMultiLine) { return firstLine; }
    var ident = new Array(isMultiLine.index+1).join(' ');
    var identRE = new RegExp('^('+ident+' )'); // + 1 space
    var blockLines = [];
    blockLines.push(firstLine.replace(/\r?$/,''));
    ++startLine; // skip first line
    var line;
    for( ; startLine<lines.length; ++startLine) {
        line = lines[startLine];
        if(! identRE.test(line)) { break; }
        blockLines.push(line.replace(/\r?$/,'').replace(/^\s*/,''));
    }
    var closeRE = new RegExp('^('+ident+(isMultiLine[2]?'\\)':'')+'\\);\r?)$');
    if(! closeRE.test(line)) { throw new Error('bad multiline block at line '+(startLine+1)); }
    blockLines.push(line);
    return blockLines.join('\n');
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
                if(!stack){
                    selfExplain.assert.log('ASSERT FAILED');
                    selfExplain.assert.log('UNKNOWN','====', value);
                    throw new Error("assert failed");
                }
                //console.log('+++++++++++++ STACK', stack);
                linea=stack.split(/\n\r?/)[3];
            }
        }else{
            linea=stack.split(/\n\r?/)[2];
        }
        //console.log("stack", stack);
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
        var errorBlock = getErrorBlock(lines, numLine-1);
        //console.log("errorBlock["+errorBlock+"]");
        //var errorLineParts=errorBlock.match(/^\s+(eval\s*\()?(\w+)s*\((.*)(\))\s*\)?[^)]*$/);
        var errorLineParts=errorBlock.match(/^\s+(eval\s*\()?(\w+)s*\(([\s\S]*)(\))\s*\)?[^)]*$/);
        if(!errorLineParts){
            console.log('errorBlock'); console.log(errorBlock);
        }
        //console.log("ELP"); console.log(errorLineParts)
        var withEval=errorLineParts[1];
        var functionName=errorLineParts[2];
        var expression=errorLineParts[3].trim();
        if(withEval){
            expression = expression.substr(0,expression.length-1);
        }
        var then=[];
        selfExplain.assert.log('ASSERT FAILED');
        if(!withEval){
            selfExplain.assert.log(expression, '====', value);
            throw new Error("assert failed in line "+numLine);
        }
        var expressions={};
        var i=99999;
        var result={changes:true, parts:[esprima.parse(expression)]};
        var showAnt='!~';
        while(i>0 && result.changes){
            i--;
            result = separateParts(result, expressions);
            /*eslint no-loop-func: 0*/
        }
        for(expression in expressions){
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

/*
selfExplain.assert.setOptions = function setOptions(opts){
    selfExplain.assert.opts = opts || {};
    escodegen_opts = opts.escodegen || escodegen_opts_def;
};
*/

selfExplain.assert.opts = {showMode: 'expressions'};

selfExplain.assertCatch = function(f,regexp){
    try{
        f();
    }catch(err){
        if(!regexp.test(err.message)){
            throw new Error(regexp.source+' expected '+err.message+' obtained');
        }
        return;
    }
    throw new Error('function does not throws any error '+regexp.source+' expected');
};

selfExplain.assert.formatDiff = function formatDiff(diff, prefix){
    return prefix ? prefix+': '+diff : diff;
};

selfExplain.assert.stringify = function stringify(a){
    if(a instanceof Date){
        return datetime.ms(a).toYmdHms();
    }
    return JSON.stringify(a);
};

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
        }else if(result.length === opts.maxDifferences){
            result.push("...");
            return false;
        }
        return true;
    };
    var compAndCollect = function compAndCollect(index, prefix){
        var diff = selfExplain.assert.differences(a[index], b[index], opts, prefix);
        if(diff){
            return collect(diff);
        }
        return true;
    };
    if(a instanceof Array && b instanceof Array){
        for(var i_ab=0; i_ab<Math.max(a.length, b.length); i_ab++){
            if(!compAndCollect(i_ab,  prefix+"[" + (i_ab) + "]")) break;
        }
        return result.length ? result.join("\n") : null;
    }
    if(a instanceof Date && b instanceof Date) {
        var rv = [];
        var timesDiffer = timeStr(a) !== timeStr(b);
        var msDiff = a.getTime()-b.getTime();
        var showTimeDiff = Math.abs(msDiff) <= 359999000; // 99 * 60 * 60 * 1000 + 59 * 60 * 1000 + 59 * 1000;
        if(datetime.ms(a).toYmd() !== datetime.ms(b).toYmd()) {
            var aas = datetime.ms(a).toYmdHmsM();
            var bbs = datetime.ms(b).toYmdHmsM();
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
            rv.push(timeInterval(msDiff).toHms());
            var ms = Math.floor(Math.abs(msDiff) % 1000);
            if(ms>0) { rv.push('.'+ms); }
        }
        return rv.join('');
    }
    if(a instanceof Object && b instanceof Object){
        if(!opts.duckTyping && a.constructor !== b.constructor){
            return ".class: "+constructorName(a)+' != '+constructorName(b);
        }
        result = [];
        var aKeys = Object.keys(a);
        var bKeys = Object.keys(b);
        aKeys.forEach(function(name, i){
            if(!opts.unordered && bKeys[i]!==name){
                collect(prefix+'{'+i+'}: .'+name+' != '+(i>=bKeys.length?'undefined':'.'+bKeys[i]));
            }else{
                compAndCollect(name,  prefix+"."+name);
            }
        });
        if(opts.unordered){
            for(var name in b){
                if(!(name in a)){
                    compAndCollect(name,  prefix+"."+name);
                }
            }
        }else{
            var ib = aKeys.length;
            while(ib<bKeys.length){
                collect(prefix+'{'+ib+'}: undefined != .'+bKeys[ib]);
                ib++;
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
    return format(selfExplain.assert.stringify(a)+' != '+selfExplain.assert.stringify(b), prefix);
};

selfExplain.assert.allDifferences = function allDifferences(a,b,opts){
    return selfExplain.assert.differences(a, b, changing(selfExplain.assert.allDifferences.opts, opts||{}));
};

selfExplain.assert.allDifferences.opts = {
    minLengthToSubstr: 16,
    substrLengthArgument: 10,
    split: /\n/,
    maxDifferences: 10,
};

selfExplain.assert.bigDifferences = function bigDifferences(a,b){   
    return selfExplain.assert.differences(a, b, changing(
        selfExplain.assert.allDifferences.opts, selfExplain.assert.bigDifferences.opts
    ));
};

selfExplain.assert.bigDifferences.opts = {
    autoTypeCast:true,
    delta:0.00000001,
    split: /\r?\n/,
    unordered: true,
    duckTyping: true,
};

return selfExplain;

});
