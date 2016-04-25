global.describe = function(){};
global.it = { demo: true } ; //function(){};

global.it.demo == true;

console.log('start demo');

require('../test/test.js');

console.log('demo end');
