import { metaCompute, metaWatch } from './symbols';

interface ComputedDescriptor {
  get: () => any;
  set: () => any;
}

export default function describeComputed (
  propertyKey,
  watchKeys: string[],
  { get: getCompute }: ComputedDescriptor | PropertyDescriptor
) {
  const needsWatchersSet = !!watchKeys.length;

  return {
    get () {
      const computedMeta = this[metaCompute] || (this[metaCompute] = {});
      let propMeta = computedMeta && computedMeta[propertyKey];

      if (!propMeta) {
        propMeta = computedMeta[propertyKey] = {};

        if (needsWatchersSet) {
          const watcherMeta = this[metaWatch] || (this[metaWatch] = new Map());

          // TODO: break down strings and recursive loop to add watch meta to each child object
          for (const key of watchKeys) {
            let keyWatchers = watcherMeta.get(key);

            if (!keyWatchers) {
              watcherMeta.set(key, (
                keyWatchers = new Map()
              ));
            }

            // DRY it up
            let thisWatchers = keyWatchers.get(this);

            if (!thisWatchers) {
              keyWatchers.set(this, (
                thisWatchers = new Set()
              ));
            }

            thisWatchers.add(propertyKey);
          }
        }
      }
      else if (propMeta.valid) {
        return propMeta.cache;
      }

      propMeta.valid = true;
      return propMeta.cache = getCompute.call(this);
    },
  };
}
