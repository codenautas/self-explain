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
![extending](https://img.shields.io/badge/stability-extending-orange.svg)
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

assert(alpha / 2 > betha -1);
```

<!--lang:es-->
Ejecuta la expresión como si fuera un `assert`, y si la expresión evalúa a `false` se genera
avisa mostrando la expresión que falló (sin necesidad de explicitarla).
(Además de lanza la excepción correspondiente)

<!--lang:en--]
It controls the expression like `assert` does. 
If the expression evaluates to `false` it will show the expression and the value.
(also throws the Exception)
[!--lang:*-->

```txt
ASSERT FAILED
alpha / 2 > betha -1 ==== false
```

<!--lang:es-->
## Mucha más información
<!--lang:en--]
## Much more info
[!--lang:*-->
```js
var assert = require('self-exlain').assert;

var alpha = 10;
var betha = 7;

eval(assert(alpha / 2 > betha -1));
```

<!--lang:es-->
Agregando `eval` como prefijo del assert se obtiene la evaluación
de todas las expresiones intermedias

<!--lang:en--]
Adding `eval` to the assert It will shows the evaluation of all subexpressions
[!--lang:*-->

```txt
ASSERT FAILED
alpha / 2 > betha -1 ==== false
alpha / 2 ==== 5
betha -1 ==== 6
alpha ==== 10
betha ==== 7
```

<!--lang:es-->
## Excepciones

La función `assertCatch` controla que se lance una excepción.

<!--lang:en--]
## Exceptions

Function `assertCatch` controls that an Error been throwed.

[!--lang:*-->

```js
assertCatch(function{
    if(error){
        throw new Error('an error');
    }
}, /an error/);
```

<!--lang:*-->
## Tests with real devices

NPM version | Device                 | OS            | nav
------------|------------------------|---------------|---------------
0.10.0      | HTC Desire             | Android 2.2.2 | Android 2.2.2
0.10.0      | Samgsung Galaxy Note 4 | Android 5.1.1 | Samsung Internet 4.0.0
0.10.2      | Samgsung Galaxy Note 4 | Android 6.0.1 | Chrome Mobile 50.0.2661
0.10.0      | Blue Vivo Air LTE      | Android 5.0.2 | Chrome Mobile 50.0.2661
0.10.0      | iPad mini Retina       | iOS 8.4.0     | Mobile Safari 8.0.0
0.10.0      | VMWare                 | WinXP         | IE 8.0.0

<!--lang:es-->
## Licencia
<!--lang:en--]
## License
[!--lang:*-->

[MIT](LICENSE)

