# self-explained
self explained tools - starting with "expect"

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
var expect = require('self-exlain').expect;

var alpha = 10;
var betha = 7;

eval(expect(alpha / 2 > betha -1));
```

It controls the expression like `assert` does.
If the expression evaluates to `false` it will show
**much more info in the console**
(also throws the Exception)

```txt
EXPECT FAILED
alpha / 2 > betha -1
10 / 2 > 7 - 1
5 > 6
false
```

## License

[MIT](LICENSE)

