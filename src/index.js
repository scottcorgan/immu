const IMMUTABLE_TYPES = {
  'function': true,
  'string': true,
  'boolean': true,
  'number': true,
  'undefined': true
};

export default function immu (data) {

  // Values that are already immutable
  if (IMMUTABLE_TYPES[typeof data] !== undefined || data === null) {
    return data;
  }

  // Already immutable
  if (typeof data.toJS === 'function') {
    return data;
  }

  return Object.freeze(
    Array.isArray(data) ? immutableArray(data) : immutableObject(data)
  )
}

function immutableObject (obj) {

  let definedProps = defineDefaultProps(obj)

  Object.keys(obj).forEach(name => {

    let value = obj[name]

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

  return Object.create(
    Object.getPrototypeOf(obj),
    definedProps
  )
}

function immutableArray (arr) {

  let data = arr.slice(0).map(immu)
  let iteratorNames = ['forEach', 'map', 'filter', 'some', 'every']
  let reducerNames = ['reduce', 'reduceRight']
  let immutatorNames = ['concat', 'join', 'slice', 'indexOf', 'lastIndexOf', 'reverse']
  let props = {
    ...defineDefaultProps(arr),
    push: defineProp('push', () => (...args) => immu(data.concat(args))),
    unshift: defineProp('unshift', () => (...args) => immu(args.concat(data))),
    sort: defineProp('sort', () => {

      return fn => {

        if (!fn) {
          return immu(arr.sort())
        }

        return immu(arr.sort((a, b) => fn(immu(a), immu(b))))
      }
    }),
    splice: defineProp('splice', function () {

      return function (...args) {

        let start = args[0];
        let deleteCount = args[1];
        let items = args.slice(2) || [];
        let beginning = data.slice(0, start);
        let end = data.slice(start + deleteCount);

        return beginning.concat(items, end)
      }
    })
  }

  iteratorNames.forEach(name => props[name] = defineProp(name, () => iterators(arr, name)))
  immutatorNames.forEach(name => props[name] = defineProp(name, () => immutators(arr, name)))
  reducerNames.forEach(name => {

    props[name] = defineProp(name, () => {

      return (fn, initialValue) => {

        return immu(arr[name]((...args) => fn(...(args.map(immu))), immu(initialValue)))
      }
    })
  })

  return Object.defineProperties(data, props)
}

function iterators (arr, iter) {

  return fn => immu(arr[iter]((...args) => fn(...(args.map(immu)))))
}

function immutators (arr, immutator) {

  return (...args) => immu(arr[immutator](...args))
}

function defineDefaultProps (data) {

  return {
    toJS: {value: () => data},
    toJSON: {value: () => data},
    valueOf: {value: () => data.valueOf()},
    toString: {value: () => data.toString()},
    toLocaleString: {value: () => data.toLocaleString()}
  }
}

function defineProp (name, get) {

  return {
    set (newValue) { // TODO: test this

      throw new Error(
        'Cannot change value "' + name + '" to "' + newValue +  '" of an immutable property'
      );
    },
    get
  }
}
