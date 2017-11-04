import { expect } from 'chai';
import { set, watch } from './capi';

describe('#set()', () => {
  it('should assign the new value', () => {
    const obj : any = {};

    set(obj, 'a', true);

    expect(obj.a).to.be.true;
  });
});

describe('#watch()', () => {
  it('should run watcher when property is set', () => {
    const obj = {};
    let watchCount = 0;
    watch(obj, 'a', () => {
      watchCount++;
    });
    set(obj, 'a', 1);
    expect(watchCount).to.equal(1);
  });

  it('should not run a terminated watcher', () => {
    const obj = {};
    let watchCount = 0;
    const watchTerminator = watch(obj, 'a', () => {
      watchCount++;
    });
    set(obj, 'a', 1);
    watchTerminator();
    set(obj, 'a', 1);
    expect(watchCount).to.equal(1);
  });
  it('should run watcher when deep property is set', () => {
    const obj = { a: {} };
    let watchCount = 0;
    watch(obj, 'a.b', () => {
      watchCount++;
    });
    set(obj.a, 'b', 1);
    expect(watchCount).to.equal(1);
  });
  it('should not run a terminated deep watcher', () => {
    const obj = { a: {} };
    let watchCount = 0;
    const watchTerminator = watch(obj, 'a.b', () => {
      watchCount++;
    });
    set(obj.a, 'b', 1);
    watchTerminator();
    set(obj.a, 'b', 1);
    expect(watchCount).to.equal(1);
  });
  it('should run watcher when shallow property is set', () => {
    const obj = { a: {} };
    let watchCount = 0;
    const watchTerminator = watch(obj, 'a.b', () => {
      watchCount++;
    });
    set(obj, 'a', {});
    expect(watchCount).to.equal(1);
  });
  it('should run watcher when new deep property is set', () => {
    const obj = { a: {} };
    let watchCount = 0;
    const watchTerminator = watch(obj, 'a.b.c', () => {
      watchCount++;
    });
    set(obj, 'a', {});
    set(obj.a, 'b', 1);
    expect(watchCount).to.equal(2);
  });
  it('should not run watcher when old deep property is set', () => {
    const objA = {};
    const obj = { a: objA };
    let watchCount = 0;
    const watchTerminator = watch(obj, 'a.b.c', () => {
      watchCount++;
    });
    set(obj, 'a', {});
    set(objA, 'b', 1);
    expect(watchCount).to.equal(1);
  });
});
