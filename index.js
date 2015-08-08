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

  var definedProps = {};

  Object.keys(data).forEach(function (key) {

    var value = data[key];

    definedProps[key] = {
      enumerable: true,
      configurable: false,
      set: function () {

        throw new Error('Cannot change value of an immutable property');
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

  var immuData = Object.create({}, definedProps);

  return process && process.env && process.env.NODE_ENV === 'production'
    ? immuData
    : Object.freeze(immuData);
}

module.exports = immu;
