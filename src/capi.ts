const watchBeforeMap = new WeakMap();
const watchAfterMap = new WeakMap();

type key = symbol | string;

function runWatches (
  obj : Object,
  key : key,
  watchMap : WeakMap<Object, Object>
) {
  const watchers = watchMap.get(obj);
  if (!watchers) {
    return;
  }

  const keyWatches = watchers[key];
  if (!keyWatches) {
    return;
  }

  for (const [, callback] of keyWatches) {
    callback();
  }
}

export function set (obj : Object, key : key, value : any) {
  runWatches(obj, key, watchBeforeMap);
  const result = obj[key] = value;
  runWatches(obj, key, watchAfterMap);
  return result;
}

function _watch (
  obj : Object,
  key : key,
  callback : () => any,
  watchMap : WeakMap<Object, Object>
) {
  let watchers = watchMap.get(obj);
  if (!watchers) {
    watchers = Object.create(null) as Object;
    watchMap.set(obj, watchers);
  }

  let keyWatches = watchers[key];
  if (!keyWatches) {
    keyWatches = new Map();
    watchers[key] = keyWatches;
  }
  const watchSymbol = Symbol();
  keyWatches.set(watchSymbol, callback);

  return () => {
    keyWatches.delete(watchSymbol);
  };
}

function _watchDeep (
  _obj : Object,
  keyPath : Array<key>,
  callback : () => any,
  watchMap : WeakMap<Object, Object>,
) {
  let obj = _obj;

  const terminators : Array<() => void> = [];

  for (const [i, key] of keyPath.entries()) {
    const currentObj = obj;
    const nextObj = obj[key];

    terminators.push(
      _watch(obj, key, () => {
        callback();
        const currentValue = currentObj[key];

        if (currentValue !== nextObj) {
          const j = i + 1;
          const oldTerminators = terminators.splice(j, terminators.length - j);

          for (const terminator of oldTerminators) {
            terminator();
          }

          if (currentValue !== null && typeof currentValue === 'object') {
            const keyPathTail = keyPath.slice(j);

            terminators.concat(_watchDeep(currentValue, keyPathTail, callback, watchMap));
          }
        }
      }, watchMap)
    );

    if (nextObj === null || typeof nextObj !== 'object') {
      break;
    }

    obj = nextObj;
  }

  return terminators;
}

export function watch (
  obj : Object,
  _keyPath : string | Array<key>,
  callback : () => any,
) {
  let keyPath = _keyPath;

  if (typeof keyPath === 'string') {
    keyPath = keyPath.split('.');
  }

  const terminators = _watchDeep(obj, keyPath, callback, watchAfterMap);

  return () => {
    for (const terminator of terminators) {
      terminator();
    }
  };
}
