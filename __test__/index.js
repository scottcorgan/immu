var namespace = require('tessed').namespace;
var immu = require('../');

var hugeJSON = require('./fixtures/huge');
var test = namespace('immu');
test.arrays = test.namespace('array');
test.arrays.iteration = test.arrays.namespace('iteration');
test.arrays.accessor = test.arrays.namespace('accessor');
test.arrays.mutator = test.arrays.namespace('mutator');

test('returns fast for non-object values', function (assert) {

  var str = 'test';
  var immuStr = immu(str);
  assert.equal(immuStr, str, 'does nothing to strings');

  var num = 1;
  var immuNum = immu(num);
  assert.equal(immuNum, num, 'does nother to numbers');

  var nully = null;
  var immuNully = immu(nully);
  assert.equal(immuNully, nully, 'does nothing to null');

  var und;
  var immuUnd = immu(und);
  assert.equal(immuUnd, und, 'does nothing to undefined');

  var bool = false;
  var immuBool = immu(bool);
  assert.equal(immuBool, bool, 'does nothing to boolean');

  // NOTE: since functions can have properties as well, how do we immu this?
  var func = function () {};
  var immuFunc = immu(func);
  assert.equal(immuFunc, func, 'does nothing to functions');
});

test('simple object', function (assert) {

  var obj = {
    a: 'b',
    c: 'd'
  };
  var immuObj = immu(obj);

  assert.deepEqual(immuObj, obj, 'objects equal');
  try {
    immuObj.a = 'changed';
    assert.fail('shouldn\'t be able to mutate an immutable object');
  }
  catch (e) {
    assert.pass('can\'t mutate and immutable object');
    assert.equal(immuObj.a, 'b', 'keeps original value after trying to change');
  }

  assert.deepEqual(Object.keys(immuObj), ['a', 'c'], 'keeps keys enumerable');

  // TODO: test that property can't be configured
});

test('deep object', function (assert) {

  var deepObj = {
    a: {
      b: {
        c: 'd'
      }
    }
  };
  var immuDeepObj = immu(deepObj);

  assert.deepEqual(immuDeepObj, deepObj, 'matches keep properties');
  assert.deepEqual(immuDeepObj.a.b, {c: 'd'}, 'mostly deep property');
  assert.equal(immuDeepObj.a.b.c, 'd', 'getter for deep property');
});

test('mixed objects and arrays', function (assert) {

  var immuObj = immu(hugeJSON);

  assert.equal(immuObj.data[0].type, 'designers', 'deep value');

  try {
    immuObj.data[0].type = 'test';
    assert.fail('shouldn\'t be able to mutate an immutable object');
  }
  catch (e) {
    assert.pass('can\'t mutate and immutable object');
  }
});

test('toJS()', function (assert) {

  var obj = {
    a: {
      b: {
        c: 'd'
      }
    }
  }
  var immuObj = immu(obj);

  assert.deepEqual(immuObj.toJS(), obj, 'get raw object back');

  var backToJs = immuObj.toJS();
  assert.equal(backToJs.toJS, undefined, 'removes toJS()');

  try {
    backToJs.a = 'changed';
    assert.equal(backToJs.a, 'changed', 'returns mutable object');
  }
  catch (e) {
    assert.fail('should be able to change mutable value');
  }
});

test('try to immutable already immutable data', function (assert) {

  var obj = {a: 'b'};
  var immuObj = immu(obj);
  var immuImmuObj = immu(immuObj);

  assert.equal(typeof immuImmuObj.toJS, 'function', 'toJS() method available');

  try {
    immuImmuObj.a = 'changed'
    assert.fail('shouldn\'t be able to mutate an immutable object');
  }
  catch (e) {
    assert.pass('can\'t mutate and immutable object');
  }
});

test('adding new attributes', function (assert) {

  process.env.NODE_ENV = 'development';
  var obj = {
    a: 'b'
  };
  var immuObj = immu(obj);
  immuObj.c = 'd';
  assert.equal(immuObj.c, undefined, 'can\'t set new proprety in development');

  process.env.NODE_ENV = 'production';
  var obj2 = {
    a: 'b'
  };
  var immuObj2 = immu(obj2);
  immuObj2.c = 'd';
  assert.equal(immuObj2.c, 'd', 'can set new proprety in production (for performance)');
});

test.arrays('base', function (assert) {

  var arr = [1,2,3,4];
  var immuArr = immu(arr);

  assert.deepEqual(immuArr, arr, 'is equal');

  // NOTE: does this even matter?
  // assert.equal(Array.isArray(immuArr), true, 'is an array');

  try {
    immuArr[0] = 'asdf';
    assert.fail('shouldn\'t be able to mutate an immutable object');
  }
  catch (e) {
    assert.pass('can\'t mutate and immutable object');
    assert.equal(immuArr[0], 1, 'keeps original value after trying to change');
  }

  assert.equal(immuArr.length, 4, 'length');
  try {
    immuArr.length = 5
    assert.fail('immutable length shouldn\'t be set');
  }
  catch (e) {
    assert.pass('can\'t set length');
  }

  // test array of objects
});

test.arrays.iteration('forEach', function (assert) {

  var arr = [1,2,3,4];
  var immuArr = immu(arr);
  var count = 0;

  immuArr.forEach(function (i) {

    count += 1;
  });

  assert.equal(count, 4, 'forEach over all values');
});

test.arrays.iteration('map', function (assert) {

  var arr = [1,2,3,4];
  var immuArr = immu(arr);

  var mappedArr = immuArr.map(function (i) {

    return i + 1;
  });

  assert.equal(typeof mappedArr.toJS, 'function', 'immu data object');
  assert.deepEqual(mappedArr.toJS(), [2,3,4,5], 'mapped values');
});

test.arrays.iteration('filter', function (assert) {

  var arr = [1,2,3,4];
  var immuArr = immu(arr);

  var filteredArr = immuArr.filter(function (i) {

    return i % 2 === 0;
  });

  assert.equal(typeof filteredArr.toJS, 'function', 'immu data object');
  assert.deepEqual(filteredArr.toJS(), [2,4], 'filtered values');
});

test.arrays.iteration('some', function (assert) {

  var arr = [1,2,3,4];
  var immuArr = immu(arr);

  var someArr = immuArr.some(function (i) {

    return i === 2;
  });

  assert.deepEqual(someArr, true, 'some value');
});

test.arrays.iteration('every', function (assert) {

  var arr = [1,2,3,4];
  var immuArr = immu(arr);

  var everyArr = immuArr.every(function (i) {

    return typeof i === 'number';
  });

  assert.deepEqual(everyArr, true, 'every value');
});

test.arrays.iteration('reduce', function (assert) {

  var arr = [1,2,3,4];
  var immuArr = immu(arr);
  var total = immuArr.reduce(function (prev, curr) {

    return String(prev) + String(curr);
  }, 0);

  assert.equal(total, '01234', 'concatenated all numbers');
});

test.arrays.iteration('reduceRight', function (assert) {

  var arr = [1,2,3,4];
  var immuArr = immu(arr);
  var total = immuArr.reduceRight(function (prev, curr) {

    return String(prev) + String(curr);
  }, 0);

  assert.equal(total, '04321', 'concatenated all numbers');
});

test.arrays.accessor('concat', function (assert) {

  var arr = [1,2,3,4];
  var immuArr = immu(arr);
  var concatImmuArr = immuArr.concat(5, 6);

  assert.equal(typeof concatImmuArr.concat, 'function', 'method exists');
  assert.equal(typeof concatImmuArr.toJS, 'function', 'value is immutable');
  assert.deepEqual(concatImmuArr, [1,2,3,4,5,6], 'concat values');
});

test.arrays.accessor('join', function (assert) {

  var arr = [1,2,3,4];
  var immuArr = immu(arr);
  var joinImmuArr = immuArr.join(', ');

  assert.equal(joinImmuArr, '1, 2, 3, 4', 'join values');
});

test.arrays.accessor('slice', function (assert) {

  var arr = [1,2,3,4];
  var immuArr = immu(arr);
  var sliceImmuArr = immuArr.slice(0, 1);

  assert.equal(typeof sliceImmuArr.slice, 'function', 'method exists');
  assert.equal(typeof sliceImmuArr.toJS, 'function', 'value is immutable');
  assert.deepEqual(sliceImmuArr, [1], 'slice values');
});

test.arrays.accessor('toString', function (assert) {

  var arr = [1,2,3,4];
  var immuArr = immu(arr);

  assert.equal(immuArr.toString(), arr.toString(), 'stringed array');
});

test.arrays.accessor('toLocalString', function (assert) {

  var arr = [1,2,3,4];
  var immuArr = immu(arr);

  assert.equal(immuArr.toLocaleString(), arr.toLocaleString(), 'stringed array');
});

test.arrays.accessor('indexOf', function (assert) {

  var arr = [1,2,3,4];
  var immuArr = immu(arr);
  var idx = immuArr.indexOf(1);

  assert.equal(idx, 0, 'index value');
});

test.arrays.accessor('lastIndexOf', function (assert) {

  var arr = [1,2,3,4];
  var immuArr = immu(arr);
  var idx = immuArr.lastIndexOf(1);

  assert.equal(idx, 0, 'index value');
});

test.arrays.mutator('push', function (assert) {

  var arr = [1,2];
  var immuArr = immu(arr);
  var pushedImmuArr = immuArr.push(3, 4);

  assert.deepEqual(pushedImmuArr, [1,2,3,4], 'pushed values on array');
  assert.deepEqual(immuArr, [1,2], 'did not mutate original array');
});

// TODO: what should pop do?
test.arrays.mutator.skip('pop', function (assert) {

  var arr = [1,2];
  var immuArr = immu(arr);
  var val = immuArr.pop();

  assert.equal(val, 2, 'popped value');
  assert.deepEqual(immuArr, [1])
});

// TODO: what should shift do?
test.arrays.mutator('shift', function (assert) {


});

test.arrays.mutator('unshift', function (assert) {

  var arr = [1,2];
  var immuArr = immu(arr);
  var shiftedImmuArr = immuArr.unshift(3, 4);

  assert.deepEqual(shiftedImmuArr, [3,4,1,2], 'shifted values on array');
  assert.deepEqual(immuArr, [1,2], 'did not mutate original array');
});

test.arrays.mutator('reverse', function (assert) {

  var arr = [1,2];
  var immuArr = immu(arr);

  assert.deepEqual(immuArr.reverse(), [2,1], 'reversed value');
  assert.deepEqual(immuArr, [1,2], 'original value');
});

test.arrays.mutator('sort', function (assert) {


});

test.arrays.mutator('splice', function (assert) {


});









