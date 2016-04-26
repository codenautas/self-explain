<!--multilang v0 es:LEEME.md en:README.md -->
# self-explained
self explained tools - starting with "assert"

<!--lang:es-->
# Instalación
<!--lang:en--]
# Install
[!--lang:*-->
```sh
$ npm install self-explained
```

<!-- cucardas -->
![designing](https://img.shields.io/badge/stability-designing-red.svg)
[![npm-version](https://img.shields.io/npm/v/self-explain.svg)](https://npmjs.org/package/self-explain)
[![downloads](https://img.shields.io/npm/dm/self-explain.svg)](https://npmjs.org/package/self-explain)
[![build](https://img.shields.io/travis/codenautas/self-explain/master.svg)](https://travis-ci.org/codenautas/self-explain)
[![coverage](https://img.shields.io/coveralls/codenautas/self-explain/master.svg)](https://coveralls.io/r/codenautas/self-explain)
[![climate](https://img.shields.io/codeclimate/github/codenautas/self-explain.svg)](https://codeclimate.com/github/codenautas/self-explain)
[![dependencies](https://img.shields.io/david/codenautas/self-explain.svg)](https://david-dm.org/codenautas/self-explain)
[![qa-control](http://codenautas.com/github/codenautas/self-explain.svg)](http://codenautas.com/github/codenautas/self-explain)


<!--multilang buttons-->

idioma: ![castellano](https://raw.githubusercontent.com/codenautas/multilang/master/img/lang-es.png)
también disponible en:
[![inglés](https://raw.githubusercontent.com/codenautas/multilang/master/img/lang-en.png)](README.md)

<!--lang:es-->
## Uso
<!--lang:en--]
## Use
[!--lang:*-->
```js
var assert = require('self-exlain').assert;

var alpha = 10;
var betha = 7;

eval(assert(alpha / 2 > betha -1));
```

<!--lang:es-->
Ejecuta la expresión como si fuera un `assert`, y si la expresión evalúa a `false` se genera
**mucha más información por la consola** 
(además de lanzar la excepción correspondiente)

<!--lang:en--]
It controls the expression like `assert` does. 
If the expression evaluates to `false` it will show 
**much more info in the console** 
(also throws the Exception)
[!--lang:*-->

```txt
ASSERT FAILED
alpha / 2 > betha -1
10 / 2 > 7 - 1
5 > 6
false 
```

<!--lang:es-->
## Licencia
<!--lang:en--]
## License
[!--lang:*-->

[MIT](LICENSE)

