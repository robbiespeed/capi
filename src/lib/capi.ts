import describeComputed from './private/describe-computed';
import { metaCompute, metaWatch } from './private/symbols';

interface WatcherParent extends Map<Object, Set<string>> { }

interface WatchMap extends Map<string, WatcherParent> { }

interface ComputedPropMeta {
  valid: boolean;
  cache: any;
}

interface ComputedMeta {
  [MetaKey: string]: ComputedPropMeta;
}

export function markChange (object: Object, key: string) {
  const watcherMeta: WatchMap = object[metaWatch];

  if (watcherMeta) {
    const keyWatcherParents = watcherMeta.get(key);

    if (keyWatcherParents) {
      for (const [ watcherParent, parentKeys ] of keyWatcherParents) {
        const computedMeta: ComputedMeta = watcherParent[metaCompute];

        for (const watcherKey of parentKeys) {
          if (computedMeta[watcherKey].valid) {
            computedMeta[watcherKey].valid = false;
            markChange(watcherParent, watcherKey);
          }
        }
      }
    }
  }
}

export function set (object: Object, key: string, value: any) {
  markChange(object, key);

  return object[key] = value;
}

// computed descriptor
export function computed (...watchKeys: string[]) {
  return function (target, propertyKey: string, descriptor: PropertyDescriptor) {
    return Object.assign(descriptor, describeComputed(propertyKey, watchKeys, descriptor));
    // const getCompute: () => any = descriptor.get;
    // const needsWatchersSet = !!watchKeys.length;
    // const setCompute: Function = descriptor.set;

    // descriptor.get = function get () {
    //   const computedMeta = this[metaComputedKey] || (this[metaComputedKey] = {});
    //   let propMeta = computedMeta && computedMeta[propertyKey];
    //
    //   if (!propMeta) {
    //     propMeta = computedMeta[propertyKey] = {};
    //
    //     if (needsWatchersSet) {
    //       const watcherMeta = this[metaWatchKey] || (this[metaWatchKey] = new Map());
    //
    //       // TODO: break down strings and recursive loop to add watch meta to each child object
    //       for (const key of watchKeys) {
    //         let keyWatchers = watcherMeta.get(key);
    //
    //         if (!keyWatchers) {
    //           watcherMeta.set(key, (
    //             keyWatchers = new Map()
    //           ));
    //         }
    //
    //         // DRY it up
    //         let thisWatchers = keyWatchers.get(this);
    //
    //         if (!thisWatchers) {
    //           keyWatchers.set(this, (
    //             thisWatchers = new Set()
    //           ));
    //         }
    //
    //         thisWatchers.add(propertyKey);
    //       }
    //     }
    //   }
    //   else if (propMeta.valid) {
    //     return propMeta.cache;
    //   }
    //
    //   propMeta.valid = true;
    //   return propMeta.cache = getCompute.call(this);
    // };

    // return descriptor;
  }
}
