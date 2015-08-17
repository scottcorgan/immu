# immu [![NPM Module](http://img.shields.io/npm/v/immu.svg?style=flat-square)](https://npmjs.org/package/immu) [![NPM download count](https://img.shields.io/npm/dm/immu.svg?style=flat-square)](https://npmjs.org/package/immu) [![Build Status](http://img.shields.io/travis/scottcorgan/immu.svg?style=flat-square)](https://travis-ci.org/scottcorgan/immu)

![emu](https://cloud.githubusercontent.com/assets/974723/9231290/4e67382c-40dc-11e5-84b4-fec141bc466d.jpg)

**A TINY, fail-fast, lazy, "naked", simple immutable Javascript objects library.**

* By *TINY*, less than 1k gzipped and minified.
* By *fail-fast*, I mean you'll be notified if you try to change a property.
* By *lazy*, I mean it doesn't evaluate the mutability of a property until it absolutely has to.
* By *naked*, I mean they work like regular objects and arrays.
* By *simple*, I mean that it doesn't add any extra features to your code (except immutability, of course).

## What Immu Aims To Solve

Immu aims to solve 2 things:

1. Immutable javascript Ojects (Arrays are objects in Javascript).
2. Fail-fast errors with detailed excpetions upon attempting to mutate Objects.

Immu does not attempt to add functionality to Arrays, introduce complex data structures like *Map* and *Set*, or provide a complete solution with cursors and stores. Immu is meant to be the simplest possible solution to providing immutable objects while maintaining the native API for those objects (includeing Array methods).

### Other libraries that are similar but do more:

Each of these libraries are *GREAT* in their implementation and at the problems they solve:

* [immutable](https://github.com/facebook/immutable-js)
* [mori](https://github.com/swannodette/mori)
* [baobab](https://github.com/Yomguithereal/baobab)
* [seamless-immutable](https://github.com/rtfeldman/seamless-immutable)
* [tcomb](https://github.com/gcanti/tcomb)
* [deep-freeze](https://www.npmjs.com/package/deep-freeze)
* [freezer](https://github.com/arqex/freezer)
* [icedam](https://github.com/winkler1/icedam)
* [immutable-store](https://github.com/christianalfoni/immutable-store)

### Why Use Immutable Data?

Bugs happen because developers write them. This just puts one more layer between you and your code exploding. Immutable data can't promise to help you avoid all bugs, but can help you reason about your state much easier!

## Install

```
npm install immu --save
```

## Usage

```js
'use strict';

let immu = require('immu');

let user = {
  name: 'Someone',
  age: 99,
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
