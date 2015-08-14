// TODO: how do we handle Date, RegExp, HTMLDocument?

let alreadyImmutable = {
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

  let isArray = Array.isArray(data);
  let definedProps = {
    toJS: {
      enumerable: false,
      configurable: false,
      value: () => data
    }
  };

  Object.keys(data).forEach(name => {

    let value = data[name];

    definedProps[name] = {
      enumerable: true,
      configurable: false,
      set (newValue) {

        throw new Error('Cannot change value "' + name + '" to "' + newValue +  '" of an immutable property');
      },
      get () {

        return immu(value);
      }
    };
  });

  if (isArray) {
    definedProps = immuArrProps(data, definedProps);
  }

  return Object.freeze(
    Object.create(
      {},
      definedProps
    )
  );
}

function immuArrProps (data, definedProps) {

  definedProps.length = defProp('length', () => data.length);

  // TODO: memoize this
  ['forEach', 'map', 'filter', 'some', 'every']
    .forEach(name => {

      definedProps[name] = defProp(name, () => {

        return fn => {

          return immu(data[name]((val, idx) => {

            return fn(immu(val), idx, immu(data));
          }));
        };
      });
    });

  // TODO: memoize this
  ['reduce', 'reduceRight']
    .forEach(name => {

      definedProps[name] = defProp(name, () => {

        return (fn, initialValue) => {

          return immu(data[name]((prev, curr, idx) => {

            return fn(immu(prev), immu(curr), idx, immu(data));
          }, initialValue));
        };
      });
    });

  [
    'concat',
    'join',
    'slice',
    'indexOf',
    'lastIndexOf',
    'reverse',
    'toString',
    'toLocaleString'
  ]
    .forEach(name => {

      definedProps[name] = defProp(name, () => (...args) => immu(data[name](...args)));
    });

  definedProps.push = defProp('push', () => (...args) => immu(data.concat(...args)));
  definedProps.unshift = defProp('unshift', () => (...args) => immu(args.concat(data)));

  definedProps.sort = defProp('sort', () => {

    return fn => {

      if (!fn) {
        return immu(data.sort());
      }

      return immu(data.sort((a, b) => fn(immu(a), immu(b))));
    };
  });

  definedProps.splice = defProp('splice', function () {

    return function (...args) {

      let start = args[0];
      let deleteCount = args[1];
      let items = args.slice(2) || [];
      let beginning = data.slice(0, start);
      let end = data.slice(start + deleteCount);

      return beginning.concat(items, end);
    };
  });

  return definedProps;
}

function defProp (name, get) {

  return {
    enumerable: false, // TODO: test this
    configurable: false, // TODO: test this
    set (newValue) { // TODO: test this

      throw new Error(
        'Cannot change value "' + name + '" to "' + newValue +  '" of an immutable property'
      );
    },
    get
  }
}

export default immu;
