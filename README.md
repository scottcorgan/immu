# immu

A TINY, fail-fast, "naked" immutable data structure library.

* By TINY, I mean less than 900 bytes not minified, not gzipped.
* By fail-fast, I mean you'll be notified if you try to change a proprety.
* By naked, I mean they're just objects, arrays, etc. Nothing fancy.

## Why immutable data?

Because, bugs happen because developers write them. This just puts one more layer between you and your code exloding.

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
```

## Run Tests

```
git clone https://github.com/scottcorgan/immu.git && cd immu
npm install
npm test
```
