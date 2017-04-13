export const isEmpty = (obj = {}) => !Object.getOwnPropertyNames(obj).length;
export const values = (obj = {}) => Object.keys(obj).reduce((y, z) => y.push(obj[z]) && y, []);


export const walk = (childrenProperty, fn) => (object) => {
  const mutated = { ...fn(object) }
  const children = object[childrenProperty]
  if (children) {
    mutated[childrenProperty] = walkOverChildren(childrenProperty, fn, children)
  }
  return mutated
}

const walkOverChildren = (childrenProperty, fn, children) => (
    (children || []).map(walk(childrenProperty, fn))
)

export const sum = (numbers, by = e => e) => numbers.reduce((acc, e) => acc + by(e), 0)
export const average = numbers => sum(numbers) / numbers.length


export const abbreviateString = string => `${string.slice(0, 3)}...${string.slice(-3)}`
export const updateElement = (list, toBeUpdated, updater, comparissonFn = (a, b) => a === b) => (list || []).map(e => (comparissonFn(e, toBeUpdated) ? updater(e) : e))

const getMinAndMaxDefaultConf = {
  transformData: d => d,
  zeroAsDefault: false
};
export const getMinAndMax = (data = [], conf = getMinAndMaxDefaultConf) => data.reduce((acc, current) => {
  const value = conf.transformData(current);
  const [min, max] = acc.length ? acc : conf.zeroAsDefault ? [0, 0] : [value, value];

  return [
    value > min ? min : value,
    value < max ? max : value
  ];
}, []);

export const isFunction = value => typeof(value) === 'function'

export const identity = x => x
export const constant = x => () => x
export const trueFn = constant(true)
