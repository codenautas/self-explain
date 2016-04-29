# self-explained
self explained tools - starting with "assert"

# Install
```sh
$ npm install self-explained
```

![designing](https://img.shields.io/badge/stability-designing-red.svg)
[![npm-version](https://img.shields.io/npm/v/self-explain.svg)](https://npmjs.org/package/self-explain)
[![downloads](https://img.shields.io/npm/dm/self-explain.svg)](https://npmjs.org/package/self-explain)
[![build](https://img.shields.io/travis/codenautas/self-explain/master.svg)](https://travis-ci.org/codenautas/self-explain)
[![coverage](https://img.shields.io/coveralls/codenautas/self-explain/master.svg)](https://coveralls.io/r/codenautas/self-explain)
[![climate](https://img.shields.io/codeclimate/github/codenautas/self-explain.svg)](https://codeclimate.com/github/codenautas/self-explain)
[![dependencies](https://img.shields.io/david/codenautas/self-explain.svg)](https://david-dm.org/codenautas/self-explain)
[![qa-control](http://codenautas.com/github/codenautas/self-explain.svg)](http://codenautas.com/github/codenautas/self-explain)



language: ![English](https://raw.githubusercontent.com/codenautas/multilang/master/img/lang-en.png)
also available in:
[![Spanish](https://raw.githubusercontent.com/codenautas/multilang/master/img/lang-es.png)](LEEME.md)

## Use
```js
var assert = require('self-exlain').assert;

var alpha = 10;
var betha = 7;

assert(alpha / 2 > betha -1);
```

It controls the expression like `assert` does.
If the expression evaluates to `false` it will show the expression and the value.
(also throws the Exception)

```txt
ASSERT FAILED
alpha / 2 > betha -1 ==== false
```

## Much more info
```js
var assert = require('self-exlain').assert;

var alpha = 10;
var betha = 7;

eval(assert(alpha / 2 > betha -1));
```

Adding `eval` to the assert It will shows the evaluation of all subexpressions

```txt
ASSERT FAILED
alpha / 2 > betha -1 ==== false
alpha / 2 ==== 5
betha -1 ==== 6
alpha ==== 10
betha ==== 7
```

## License

[MIT](LICENSE)

