var namespace = require('tessed').namespace;
var immu = require('../');

var test = namespace('immu');
// test.obj = namespace('object');
// test.arr = namespace('array');

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

test('arrays', function (assert) {

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
});

test('mixed objects and arrays', function (assert) {


});

test('toJS()', function () {});
test('already immutable', function () {});
test('equality', function () {});


