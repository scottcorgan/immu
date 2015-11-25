import {namespace} from 'tessed';
import immu from '../src';

import hugeJSON from './fixtures/huge';
let test = namespace('immu');

test.arrays = test.namespace('array');
test.arrays.iteration = test.arrays.namespace('iteration');
test.arrays.accessor = test.arrays.namespace('accessor');
test.arrays.mutator = test.arrays.namespace('mutator');

test('returns fast for non-object values', ({equal}) => {

  let str = 'test';
  let immuStr = immu(str);
  equal(immuStr, str, 'does nothing to strings');

  let num = 1;
  let immuNum = immu(num);
  equal(immuNum, num, 'does nother to numbers');

  let nully = null;
  let immuNully = immu(nully);
  equal(immuNully, nully, 'does nothing to null');

  let und;
  let immuUnd = immu(und);
  equal(immuUnd, und, 'does nothing to undefined');

  let bool = false;
  let immuBool = immu(bool);
  equal(immuBool, bool, 'does nothing to boolean');

  // NOTE: since functions can have properties as well, how do we immu this?
  let func = function () {};
  let immuFunc = immu(func);
  equal(immuFunc, func, 'does nothing to functions');
});

test('simple object', ({deepEqual, pass, fail, equal}) => {

  let obj = {
    a: 'b',
    c: 'd'
  };
  let immuObj = immu(obj);

  deepEqual(immuObj, obj, 'objects equal');
  try {
    immuObj.a = 'changed';
    fail('shouldn\'t be able to mutate an immutable object');
  }
  catch (e) {
    pass('can\'t mutate and immutable object');
    equal(immuObj.a, 'b', 'keeps original value after trying to change');
  }

  deepEqual(Object.keys(immuObj), ['a', 'c'], 'keeps keys enumerable');

  // TODO: test that property can't be configured
});

test('deep object', ({equal, deepEqual}) => {

  let deepObj = {
    a: {
      b: {
        c: 'd'
      }
    }
  };
  let immuDeepObj = immu(deepObj);

  deepEqual(immuDeepObj, deepObj, 'matches keep properties');
  deepEqual(immuDeepObj.a.b, {c: 'd'}, 'mostly deep property');
  equal(immuDeepObj.a.b.c, 'd', 'getter for deep property');
  equal(immuDeepObj.a, immuDeepObj.a, 'are memoized');
});

test('mixed objects and arrays', ({equal, pass, fail}) => {

  let immuObj = immu(hugeJSON);

  equal(immuObj.data[0].type, 'designers', 'deep value');

  try {
    immuObj.data[0].type = 'test';
    fail('shouldn\'t be able to mutate an immutable object');
  }
  catch (e) {
    pass('can\'t mutate and immutable object');
  }
});

test('toJS()', ({deepEqual, equal, fail}) => {

  let obj = {
    a: {
      b: {
        c: 'd'
      }
    }
  }
  let immuObj = immu(obj);

  deepEqual(immuObj.toJS(), obj, 'get raw object back');

  let backToJs = immuObj.toJS();
  equal(backToJs.toJS, undefined, 'removes toJS()');

  try {
    backToJs.a = 'changed';
    equal(backToJs.a, 'changed', 'returns mutable object');
  }
  catch (e) {
    fail('should be able to change mutable value');
  }
});

test('try to immutable already immutable data', ({equal, pass, fail}) => {

  let obj = {a: 'b'};
  let immuObj = immu(obj);
  let immuImmuObj = immu(immuObj);

  equal(typeof immuImmuObj.toJS, 'function', 'toJS() method available');

  try {
    immuImmuObj.a = 'changed'
    fail('shouldn\'t be able to mutate an immutable object');
  }
  catch (e) {
    pass('can\'t mutate and immutable object');
  }
});

test('adding new attributes', ({equal, fail, pass}) => {

  process.env.NODE_ENV = 'development';
  let obj = {
    a: 'b'
  };
  let immuObj = immu(obj);
  try {
    immuObj.c = 'd';
    fail('Shouldn\'t be able to set value on frozen object');
  }
  catch (e) {
    pass('frozen object in dev environment');
    equal(immuObj.c, undefined, 'can\'t set new proprety');
  }
});

test.arrays('base', ({equal, deepEqual, pass, fail}) => {

  let arr = [1,2,3,4];
  let immuArr = immu(arr);

  deepEqual(immuArr, arr, 'is equal');
  equal(Array.isArray(immuArr), true, 'is an array');

  try {
    immuArr[0] = 'asdf';
    fail('shouldn\'t be able to mutate an immutable object');
  }
  catch (e) {
    pass('can\'t mutate and immutable object');
    equal(immuArr[0], 1, 'keeps original value after trying to change');
  }

  equal(immuArr.length, 4, 'length');
  try {
    immuArr.length = 5
    fail('immutable length shouldn\'t be set');
  }
  catch (e) {
    pass('can\'t set length');
  }

  // test array of objects
});

test.arrays.iteration('forEach', ({equal}) => {

  let arr = [1,2,3,4];
  let immuArr = immu(arr);
  let count = 0;

  immuArr.forEach(function (i) {

    count += 1;
  });

  equal(count, 4, 'forEach over all values');
});

test.arrays.iteration('map', ({equal, deepEqual}) => {

  let arr = [1,2,3,4];
  let immuArr = immu(arr);

  let mappedArr = immuArr.map(function (i) {

    return i + 1;
  });

  equal(typeof mappedArr.toJS, 'function', 'immu data object');
  deepEqual(mappedArr.toJS(), [2,3,4,5], 'mapped values');
});

test.arrays.iteration('filter', ({equal, deepEqual}) => {

  let arr = [1,2,3,4];
  let immuArr = immu(arr);

  let filteredArr = immuArr.filter(function (i) {

    return i % 2 === 0;
  });

  equal(typeof filteredArr.toJS, 'function', 'immu data object');
  deepEqual(filteredArr.toJS(), [2,4], 'filtered values');
});

test.arrays.iteration('some', ({deepEqual}) => {

  let arr = [1,2,3,4];
  let immuArr = immu(arr);

  let someArr = immuArr.some(function (i) {

    return i === 2;
  });

  deepEqual(someArr, true, 'some value');
});

test.arrays.iteration('every', ({deepEqual}) => {

  let arr = [1,2,3,4];
  let immuArr = immu(arr);

  let everyArr = immuArr.every(function (i) {

    return typeof i === 'number';
  });

  deepEqual(everyArr, true, 'every value');
});

test.arrays.iteration('reduce', ({equal}) => {

  let arr = [1,2,3,4];
  // let arr2 = [{a: 'b'}]
  let immuArr = immu(arr);
  let total = immuArr.reduce(function (prev, curr) {

    return String(prev) + String(curr);
  }, 0);

  equal(total, '01234', 'concatenated all numbers');
});

test.arrays.iteration('reduceRight', ({equal}) => {

  let arr = [1,2,3,4];
  let immuArr = immu(arr);
  let total = immuArr.reduceRight(function (prev, curr) {

    return String(prev) + String(curr);
  }, 0);

  equal(total, '04321', 'concatenated all numbers');
});

test.arrays.accessor('concat', ({equal, deepEqual}) => {

  let arr = [1,2,3,4];
  let immuArr = immu(arr);
  let concatImmuArr = immuArr.concat(5, 6);

  equal(typeof concatImmuArr.concat, 'function', 'method exists');
  equal(typeof concatImmuArr.toJS, 'function', 'value is immutable');
  deepEqual(concatImmuArr, [1,2,3,4,5,6], 'concat values');
});

test.arrays.accessor('join', ({equal}) => {

  let arr = [1,2,3,4];
  let immuArr = immu(arr);
  let joinImmuArr = immuArr.join(', ');

  equal(joinImmuArr, '1, 2, 3, 4', 'join values');
});

test.arrays.accessor('slice', ({equal, deepEqual}) => {

  let arr = [1,2,3,4];
  let immuArr = immu(arr);
  let sliceImmuArr = immuArr.slice(0, 1);

  equal(typeof sliceImmuArr.slice, 'function', 'method exists');
  equal(typeof sliceImmuArr.toJS, 'function', 'value is immutable');
  deepEqual(sliceImmuArr, [1], 'slice values');
});

test.arrays.accessor('toString', ({equal}) => {

  let arr = [1,2,3,4];
  let immuArr = immu(arr);

  equal(immuArr.toString(), arr.toString(), 'stringed array');
});

test.arrays.accessor('toLocalString', ({equal}) => {

  let arr = [1,2,3,4];
  let immuArr = immu(arr);

  equal(immuArr.toLocaleString(), arr.toLocaleString(), 'stringed array');
});

test.arrays.accessor('indexOf', ({equal}) => {

  let arr = [1,2,3,4];
  let immuArr = immu(arr);
  let idx = immuArr.indexOf(1);

  equal(idx, 0, 'index value');
});

test.arrays.accessor('lastIndexOf', ({equal}) => {

  let arr = [1,2,3,4];
  let immuArr = immu(arr);
  let idx = immuArr.lastIndexOf(1);

  equal(idx, 0, 'index value');
});

test.arrays.mutator('push', ({deepEqual}) => {

  let arr = [1,2];
  let immuArr = immu(arr);
  let pushedImmuArr = immuArr.push(3, 4, [5, 6]);

  deepEqual(pushedImmuArr, [1,2,3,4,[5,6]], 'pushed values on array');
  deepEqual(immuArr, [1,2], 'did not mutate original array');
});

// TODO: what should pop do?
test.arrays.mutator.skip('pop', ({deepEqual, equal}) => {

  let arr = [1,2];
  let immuArr = immu(arr);
  let val = immuArr.pop();

  equal(val, 2, 'popped value');
  deepEqual(immuArr, [1])
});

// TODO: what should shift do?
test.arrays.mutator('shift', () => {


});

test.arrays.mutator('unshift', ({deepEqual}) => {

  let arr = [1,2];
  let immuArr = immu(arr);
  let shiftedImmuArr = immuArr.unshift(3, 4);

  deepEqual(shiftedImmuArr, [3,4,1,2], 'shifted values on array');
  deepEqual(immuArr, [1,2], 'did not mutate original array');
});

test.arrays.mutator('reverse', ({deepEqual}) => {

  let arr = [1,2];
  let immuArr = immu(arr);

  deepEqual(immuArr.reverse(), [2,1], 'reversed value');
  deepEqual(immuArr, [1,2], 'original value');
});

test.arrays.mutator('sort', ({deepEqual}) => {

  let arr = [4,2,3,1];
  let immuArr = immu(arr);

  deepEqual(immuArr.sort(), [1,2,3,4], 'basic sort');

  let objArr = [{age: 31}, {age: 27}, {age: 51}];
  let immuObjArr = immu(objArr);

  let sortedImmuObjArr = immuObjArr.sort(function (a, b) {

    if (a.age > b.age) {
      return 1;
    }

    if (a.age < b.age) {
      return -1;
    }

    return 0;
  });

  deepEqual(
    sortedImmuObjArr,
    [{age: 27}, {age: 31}, {age: 51}],
    'custom sort function'
  );
});

test.arrays.mutator('splice', ({deepEqual}) => {

  let arr = [1, 2, 3, 4];
  let immuArr = immu(arr);

  deepEqual(immuArr.splice(1, 1), [1, 3, 4], 'remove item');
  deepEqual(immuArr.splice(1, 1, 'two'), [1, 'two', 3, 4], 'remove and insert');
});

test.arrays('JSON.stringify()', ({deepEqual}) => {

  let arr = [1, 2, 3, 4];
  let immuArr = immu(arr);

  deepEqual(JSON.stringify(immuArr), JSON.stringify(arr), 'stringified');
})









