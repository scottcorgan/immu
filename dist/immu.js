'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports['default'] = immu;

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

var IMMUTABLE_TYPES = {
  'function': true,
  string: true,
  boolean: true,
  number: true,
  undefined: true
};

function immu(data) {

  // Values that are already immutable
  if (IMMUTABLE_TYPES[typeof data] !== undefined || data === null) {
    return data;
  }

  // Already immutable
  if (typeof data.toJS === 'function') {
    return data;
  }

  return Object.freeze(Array.isArray(data) ? immutableArray(data) : immutableObject(data));
}

function immutableObject(obj) {

  var definedProps = defineDefaultProps(obj);

  Object.keys(obj).forEach(function (name) {

    var value = obj[name];

    definedProps[name] = {
      enumerable: true,
      set: function set(newValue) {

        throw new Error('Cannot change value "' + name + '" to "' + newValue + '" of an immutable property');
      },
      get: function get() {

        return value = immu(value);
      }
    };
  });

  return Object.create(Object.getPrototypeOf(obj), definedProps);
}

function immutableArray(arr) {

  var data = arr.slice(0).map(immu);
  var iteratorNames = ['forEach', 'map', 'filter', 'some', 'every'];
  var reducerNames = ['reduce', 'reduceRight'];
  var immutatorNames = ['concat', 'join', 'slice', 'indexOf', 'lastIndexOf', 'reverse'];
  var props = _extends({}, defineDefaultProps(arr), {
    push: defineProp('push', function () {
      return function () {
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        return immu(data.concat(args));
      };
    }),
    unshift: defineProp('unshift', function () {
      return function () {
        for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          args[_key2] = arguments[_key2];
        }

        return immu(args.concat(data));
      };
    }),
    sort: defineProp('sort', function () {

      return function (fn) {

        if (!fn) {
          return immu(arr.sort());
        }

        return immu(arr.sort(function (a, b) {
          return fn(immu(a), immu(b));
        }));
      };
    }),
    splice: defineProp('splice', function () {

      return function () {
        for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
          args[_key3] = arguments[_key3];
        }

        var start = args[0];
        var deleteCount = args[1];
        var items = args.slice(2) || [];
        var beginning = data.slice(0, start);
        var end = data.slice(start + deleteCount);

        return beginning.concat(items, end);
      };
    })
  });

  iteratorNames.forEach(function (name) {
    return props[name] = defineProp(name, function () {
      return iterators(arr, name);
    });
  });
  immutatorNames.forEach(function (name) {
    return props[name] = defineProp(name, function () {
      return immutators(arr, name);
    });
  });
  reducerNames.forEach(function (name) {

    props[name] = defineProp(name, function () {

      return function (fn, initialValue) {

        return immu(arr[name](function () {
          for (var _len4 = arguments.length, args = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
            args[_key4] = arguments[_key4];
          }

          return fn.apply(undefined, _toConsumableArray(args.map(immu)));
        }, immu(initialValue)));
      };
    });
  });

  return Object.defineProperties(data, props);
}

function iterators(arr, iter) {

  return function (fn) {
    return immu(arr[iter](function () {
      for (var _len5 = arguments.length, args = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
        args[_key5] = arguments[_key5];
      }

      return fn.apply(undefined, _toConsumableArray(args.map(immu)));
    }));
  };
}

function immutators(arr, immutator) {

  return function () {
    return immu(arr[immutator].apply(arr, arguments));
  };
}

function defineDefaultProps(data) {

  return {
    toJS: { value: function value() {
        return data;
      } },
    toJSON: { value: function value() {
        return data;
      } },
    valueOf: { value: function value() {
        return data.valueOf();
      } },
    toString: { value: function value() {
        return data.toString();
      } },
    toLocaleString: { value: function value() {
        return data.toLocaleString();
      } }
  };
}

function defineProp(name, get) {

  return {
    set: function set(newValue) {
      // TODO: test this

      throw new Error('Cannot change value "' + name + '" to "' + newValue + '" of an immutable property');
    },
    get: get
  };
}
module.exports = exports['default'];
