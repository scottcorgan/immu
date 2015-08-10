// TODO: how do we handle Date, RegExp, HTMLDocument?

var alreadyImmutable = {
  'function': true,
  'string': true,
  'boolean': true,
  'number': true,
  'undefined': true
};

function immu (data) {

  // Values that are already immutable
  if (alreadyImmutable[typeof data] !== undefined || data === null) {
    return data;
  }

  // Already immutable
  if (typeof data.toJS === 'function') {
    return data;
  }

  var isArray = Array.isArray(data);
  var definedProps = {};

  Object.keys(data).forEach(function (key) {

    var value = data[key];

    definedProps[key] = {
      enumerable: true,
      configurable: false,
      set: function (newValue) {

        throw new Error('Cannot change value "' + key + '" to "' + newValue +  '" of an immutable property');
      },
      get: function () {

        return immu(value);
      }
    };
  });

  definedProps.toJS = {
    enumerable: false,
    configurable: false,
    value: function () {

      return data;
    }
  };

  if (isArray) {
    definedProps = immuArrProps(data, definedProps);
  }

  var immuData = Object.create({}, definedProps);

  return process && process.env && process.env.NODE_ENV === 'production'
    ? immuData
    : Object.freeze(immuData);
}

function immuArrProps (data, definedProps) {

  definedProps.length = {
    enumerable: false,
    configurable: false,
    set: function (newValue) {

      throw new Error('Cannot change the length property of an immutable array');
    },
    get: function () {

      return data.length;
    }
  }

  // TODO: memoize this
  var iterationMethods = ['forEach', 'map', 'filter', 'some', 'every']
  iterationMethods.forEach(function (name) {

    definedProps[name] = {
      enumerable: false,
      configurable: false,
      set: function () {

        // TODO: test this
        throw new TypeError('Cannot change the "' + name + '()" method on an immutable object');
      },
      get: function () {

        return function (fn) {

          return immu(data[name](function (val, idx) {

            return fn(immu(val), idx, immu(data));
          }));
        };
      }
    }
  });

  // TODO: memoize this
  var reduceMethods = ['reduce', 'reduceRight'];
  reduceMethods.forEach(function (name) {

    definedProps[name] = {
      enumerable: false,
      configurable: false,
      set: function () {

        // TODO: test this
        throw new TypeError('Cannot change the "' + name + '()" method on an immutable object');
      },
      get: function () {

        return function (fn, initialValue) {

          return immu(data[name](function (prev, curr, idx) {

            return fn(immu(prev), immu(curr), idx, immu(data));
          }, initialValue));
        };
      }
    }
  });

  var accessorMethods = ['concat', 'join', 'slice', 'indexOf', 'lastIndexOf', 'reverse'];
  accessorMethods.forEach(function (name) {

    definedProps[name] = {
      enumerable: false,
      configurable: false,
      set: function () {

        // TODO: test this
        throw new TypeError('Cannot change the "' + name + '()" method on an immutable object');
      },
      get: function () {

        return function () {

          return immu(data[name].apply(data, arguments));
        }
      }
    }
  });

  // TODO: memoize this
  var stringMethods = ['toString', 'toLocaleString'];
  stringMethods.forEach(function (name) {

    definedProps[name] = {
      enumerable: false,
      configurable: false,
      set: function () {

        // TODO: test this
        throw new TypeError('Cannot change the "' + name + '()" method on an immutable object');
      },
      get: function () {

        return function () {

          return data[name]();
        };
      }
    };
  });

  definedProps.push = {
    enumerable: false,
    configurable: false,
    set: function () {

      // TODO: test this
      throw new TypeError('Cannot change the "push()" method on an immutable object');
    },
    get: function () {

      return function () {

        return immu(data.concat.apply(data, arguments));
      };
    }
  };

  definedProps.unshift = {
    enumerable: false,
    configurable: false,
    set: function () {

      // TODO: test this
      throw new TypeError('Cannot change the "unshift()" method on an immutable object');
    },
    get: function () {

      return function () {

        var args = asArray(arguments);
        return immu(args.concat(data));
      };
    }
  };

  definedProps.sort = {
    enumerable: false,
    configurable: false,
    set: function () {

      // TODO: test this
      throw new TypeError('Cannot change the "sort()" method on an immutable object');
    },
    get: function () {

      return function (fn) {

        if (!fn) {
          return immu(data.sort());
        }

        return immu(data.sort(function (a, b) {

          return fn(immu(a), immu(b));
        }));
      };
    }
  };

  definedProps.splice = {
    enumerable: false,
    configurable: false,
    set: function () {

      // TODO: test this
      throw new TypeError('Cannot change the "splice()" method on an immutable object');
    },
    get: function () {

      return function () {

        var start = arguments[0];
        var deleteCount = arguments[1];
        var items = asArray(arguments).slice(2) || [];
        var beginning = data.slice(0, start);
        var end = data.slice(start + deleteCount);

        return beginning.concat(items, end);
      };
    }
  };

  return definedProps;
}

function asArray (args) {

  return Array.prototype.slice.call(args);
}

module.exports = immu;
