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

  return Object.create({
    toJS: function () {

      return data;
    }
  }, definedProps);
}

module.exports = immu;
