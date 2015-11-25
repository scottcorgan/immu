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
    toJS: {value: () => data},
    toJSON: {value: () => data},
    valueOf: {value: () => data.valueOf()},
    toString: {value: () => data.toString()},
    toLocaleString: {value: () => data.toLocaleString()}
  };

  Object.keys(data).forEach(name => {

    let value = data[name]

    definedProps[name] = {
      enumerable: true,
      set (newValue) {

        throw new Error('Cannot change value "' + name + '" to "' + newValue +  '" of an immutable property');
      },
      get () {

        return (value = immu(value));
      }
    };
  });

  function immuArr (arr) {

    let data = arr.slice(0).map(immu)

    function iterators (arr, iter) {

      return fn => immu(arr[iter]((...args) => fn(...(args.map(immu)))))
    }
    function immutators (arr, mut) {

      return (...args) => immu(arr[mut](...args))
    }

    let iteratorNames = ['forEach', 'map', 'filter', 'some', 'every']
    let reducerNames = ['reduce', 'reduceRight']
    let immutatorNames = ['concat', 'join', 'slice', 'indexOf', 'lastIndexOf', 'reverse']
    let props = {
      toJS: {value: () => arr},
      push: defProp('push', () => (...args) => immu(data.concat(args))),
      unshift: defProp('unshift', () => (...args) => immu(args.concat(data)))
    }
    props.sort = defProp('sort', () => {

      return fn => {

        if (!fn) {
          return immu(arr.sort())
        }

        return immu(arr.sort((a, b) => fn(immu(a), immu(b))))
      }
    })
    props.splice = defProp('splice', function () {

        return function (...args) {

          let start = args[0];
          let deleteCount = args[1];
          let items = args.slice(2) || [];
          let beginning = data.slice(0, start);
          let end = data.slice(start + deleteCount);

          return beginning.concat(items, end)
        }
      })
    iteratorNames.forEach(name => props[name] = defProp(name, () => iterators(arr, name)))
    reducerNames.forEach(name => {

      props[name] = defProp(name, () => {

        return (fn, initialValue) => {

          return immu(arr[name]((prev, curr, idx) => {

            return fn(immu(prev), immu(curr), idx, immu(data))
          }, immu(initialValue)))
        }
      })
    })
    immutatorNames.forEach(name => props[name] = defProp(name, () => immutators(arr, name)))

    Object.defineProperties(data, props)
    return data
  }

  function immuObj (obj) {

    return Object.create(
      Object.getPrototypeOf(obj),
      definedProps
    )
  }

  return Object.freeze(isArray ? immuArr(data) : immuObj(data));
}

function defProp (name, get) {

  return {
    set (newValue) { // TODO: test this

      throw new Error(
        'Cannot change value "' + name + '" to "' + newValue +  '" of an immutable property'
      );
    },
    get
  }
}

export default immu;
