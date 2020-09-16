// @ts-nocheck
import chai from 'chai';
import di, { Injectable, Inject } from 'src/index';

describe('deeai', () => {
    afterEach(() => {
        di._restoreContainer();
    })
    it('Injectable -> Inject relationship', () => {
        @Injectable('FOO')
        class Foo{
            foo() {
                return 1;
            }
        }

        @Inject('FOO')
        class DependentClass {
            constructor(private foo: Foo) {
            }

            test() {
                return this.foo.foo();
            }
        }
        chai.expect(new DependentClass().test()).to.be.equal(1, 'Should be 1');
    });
    it('Inject override', () => {
        @Injectable('FOO')
        class Foo{
            foo() {
                return 1;
            }
        }

        @Inject('FOO')
        class DependentClass {
            constructor(private foo: Foo) {
            }

            test() {
                return this.foo.foo();
            }
        }
        const foo = { foo: () => 2 };
        chai.expect(new DependentClass(foo).test()).to.be.equal(2, 'Should be 2');
    })
})