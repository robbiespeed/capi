import { expect } from 'chai';
import * as capi from '../lib/capi';
import { metaCompute, metaWatch } from '../lib/private/symbols';


describe('Computed Decorator', function () {
  context('when no watched properties are defined', function () {
    class ComputeTest {
      computeCount = 0;

      @capi.computed()
      get value () {
        this.computeCount++;
        return 'foo';
      }
    }

    // Object.defineProperty(
    //   ComputeTest.prototype, 'value',
    //   capi.computed()(
    //     ComputeTest.prototype,
    //     'value',
    //     Object.getOwnPropertyDescriptor(ComputeTest.prototype, 'value')
    //   )
    // );

    context('when the property has yet to be accessed', function () {
      const computeTest = new ComputeTest();
      it('should not have executed the getter', function () {
        expect(computeTest).to.have.property('computeCount').equal(0);
      });
      it('should not have meta computed data for property', function () {
        expect(computeTest[metaCompute]).to.not.exist;
      });
    });

    context('when first accessing the property', function () {
      const computeTest = new ComputeTest();
      it('should return the correct value', function () {
        expect(computeTest.value).to.equal('foo');
      });
      it('should have executed the getter once', function () {
        expect(computeTest).to.have.property('computeCount').equal(1);
      });
      it('should have added meta computed data for property', function () {
        const computedMeta = computeTest[metaCompute];
        expect(computedMeta).to.have.property('value');
        expect(computedMeta).to.have.deep.property('value.cache').equal('foo');
        expect(computedMeta).to.have.deep.property('value.valid').be.true;
      });
    });

    context('when property is accesed twice', function () {
      const computeTest = new ComputeTest();
      computeTest.value;
      computeTest.value;
      it('should not have executed the getter a second time', function () {
        expect(computeTest).to.have.property('computeCount').equal(1);
      });
    });
  });

  context('when watched properties are defined', function () {
    class ComputeTest {
      computeCount = 0;
      foo = 'foo';

      @capi.computed('foo')
      get value () {
        this.computeCount++;
        return this.foo;
      }
    }

    context('when first accessing the property', function () {
      const computeTest = new ComputeTest();
      it('should return the correct value', function () {
        expect(computeTest.value).to.equal('foo');
      });
      it('should have executed the getter once', function () {
        expect(computeTest).to.have.property('computeCount').equal(1);
      });
      it('should have added meta computed data for property', function () {
        const computedMeta = computeTest[metaCompute];
        expect(computedMeta).to.have.property('value');
        expect(computedMeta).to.have.deep.property('value.cache').equal('foo');
        expect(computedMeta).to.have.deep.property('value.valid').be.true;
      });
      it('should have added meta watch data', function () {
        const watchMeta = computeTest[metaWatch];
        expect(watchMeta).to.exist;
        const watchMetaFoo = watchMeta.get('foo');
        expect(watchMetaFoo).to.exist;
        const watchers = watchMetaFoo.get(computeTest);
        expect(watchers).to.exist;
        expect(watchers.has('value')).to.be.true;
      });
    });

    context('when property is accesed twice', function () {
      const computeTest = new ComputeTest();
      it('should not have executed the getter a second time', function () {
        computeTest.value;
        computeTest.value;
        expect(computeTest).to.have.property('computeCount').equal(1);
        expect(true).to.be.true;
      });
    });

    context('when watched property changes', function () {
      const computeTest = new ComputeTest();
      it('should have the correct inital value', function () {
        expect(computeTest.value).to.equal('foo');
      });
      it('should have the new value after the watched prop changes', function () {
        capi.set(computeTest, 'foo', 'bar');
        expect(computeTest.value).to.equal('bar');
      });
      it('should have executed the getter a second time', function () {
        expect(computeTest).to.have.property('computeCount').equal(2);
      });
    });
  });
});
