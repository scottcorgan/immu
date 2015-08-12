# immu [![NPM Module](http://img.shields.io/npm/v/immu.svg?style=flat-square)](https://npmjs.org/package/immu) [![NPM download count](https://img.shields.io/npm/dm/immu.svg?style=flat-square)](https://npmjs.org/package/immu) [![Build Status](http://img.shields.io/travis/scottcorgan/immu.svg?style=flat-square)](https://travis-ci.org/scottcorgan/immu)

A TINY, fail-fast, "naked", simple immutable data structure library.

* By *TINY*, less than 1k gzipped and minified.
* By *fail-fast*, I mean you'll be notified if you try to change a proprety.
* By *naked*, I mean they work like regular objects and arrays.
* By *simple*, I mean that it doesn't add any extra features to your code (except immutability, of course).

**Immu** doesn't use `Object.freeze()` in production, so [these performance issues](http://jsperf.com/freeze-vs-seal-vs-normal/3) aren't a concern.

## Why immutable data?

Bugs happen because developers write them. This just puts one more layer between you and your code exloding.

## Install

```
npm install immu --save
```

## Usage

```js
var immu = require('immu');

var user = {
  name: 'Scott',
  age: 31,
  location: 'somewhere'
};

let immutableUser = immu(user);

try {
  immutableUser.name = 'Unchangeable';
}
catch (e) {
  console.error(e.message); // Cannot change value of an immutable property
}

console.log(immutableUser.name) // Scott

// Get the raw object back
console.log(immutableUser.toJS()); // {name: 'Scott', age: 31, location: 'somewhere'}

let list = immu([1, 2, 3, 4]);
let newList = list
  .map(item => item + 1)
  .filter(item => item % 2 === 0);
```

## Run Tests

```
git clone https://github.com/scottcorgan/immu.git && cd immu
npm install
npm test
```
