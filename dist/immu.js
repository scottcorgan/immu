'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
var alreadyImmutable = {
  'function': true,
  'string': true,
  'boolean': true,
  'number': true,
  'undefined': true
};

function immu(data) {

  // Values that are already immutable
  if (alreadyImmutable[typeof data] !== undefined || data === null) {
    return data;
  }

  // Already immutable
  if (typeof data.toJS === 'function') {
    return data;
  }

  var isArray = Array.isArray(data);
  var definedProps = {
    toJS: {
      value: function value() {
        return data;
      }
    }
  };

  Object.keys(data).forEach(function (name) {

    var value = data[name];

    definedProps[name] = {
      enumerable: true,
      set: function set(newValue) {

        throw new Error('Cannot change value "' + name + '" to "' + newValue + '" of an immutable property');
      },
      get: function get() {

        return immu(value);
      }
    };
  });

  if (isArray) {
    definedProps = immuArrProps(data, definedProps);
  }

  return Object.freeze(Object.create(Object.prototype, definedProps));
}

function immuArrProps(data, definedProps) {

  definedProps.length = defProp('length', function () {
    return data.length;
  });

  ['forEach', 'map', 'filter', 'some', 'every'].forEach(function (name) {

    definedProps[name] = defProp(name, function () {

      return function (fn) {

        return immu(data[name](function (val, idx) {

          return fn(immu(val), idx, immu(data));
        }));
      };
    });
  });

  ['reduce', 'reduceRight'].forEach(function (name) {

    definedProps[name] = defProp(name, function () {

      return function (fn, initialValue) {

        return immu(data[name](function (prev, curr, idx) {

          return fn(immu(prev), immu(curr), idx, immu(data));
        }, initialValue));
      };
    });
  });

  ['concat', 'join', 'slice', 'indexOf', 'lastIndexOf', 'reverse', 'toString', 'toLocaleString'].forEach(function (name) {

    definedProps[name] = defProp(name, function () {
      return function () {
        return immu(data[name].apply(data, arguments));
      };
    });
  });

  definedProps.push = defProp('push', function () {
    return function () {
      return immu(data.concat.apply(data, arguments));
    };
  });
  definedProps.unshift = defProp('unshift', function () {
    return function () {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      return immu(args.concat(data));
    };
  });

  definedProps.sort = defProp('sort', function () {

    return function (fn) {

      if (!fn) {
        return immu(data.sort());
      }

      return immu(data.sort(function (a, b) {
        return fn(immu(a), immu(b));
      }));
    };
  });

  definedProps.splice = defProp('splice', function () {

    return function () {
      for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      var start = args[0];
      var deleteCount = args[1];
      var items = args.slice(2) || [];
      var beginning = data.slice(0, start);
      var end = data.slice(start + deleteCount);

      return beginning.concat(items, end);
    };
  });

  return definedProps;
}

function defProp(name, get) {

  return {
    set: function set(newValue) {
      // TODO: test this

      throw new Error('Cannot change value "' + name + '" to "' + newValue + '" of an immutable property');
    },
    get: get
  };
}

exports['default'] = immu;
module.exports = exports['default'];
