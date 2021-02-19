import chai from 'chai';
import di, { Injectable, createDependencyToken, Inject } from '../src/index';

describe('deeai', () => {
    it('Get test with createDependencyToken', () => {
        class TestClass {
            public name: string = 'TestClass';

            public get age() {
                return 23;
            }

            testMethod() {
                return 'testMethodResult';
            }
        };

        const token = createDependencyToken('TestClass', TestClass);

        di.Register(token, {
            class: TestClass
        });
        const dep = di.Get(token);
        chai.expect(dep instanceof TestClass).to.be.eq(true);
        chai.expect(dep.age).to.be.eq(23);
        chai.expect(dep.name).to.be.eq('TestClass');
        chai.expect(dep.testMethod()).to.be.eq('testMethodResult');
    });
    it('Get test with string as dependency token', () => {
        class TestClass {
            public name: string = 'TestClass2';

            public get age() {
                return 22;
            }

            testMethod() {
                return 'testMethodResult2';
            }
        };
        const token = 'TestClass2';
        di.Register(token, {
            class: TestClass
        });
        const dep = di.Get(token);
        chai.expect(dep instanceof TestClass).to.be.eq(true);
        chai.expect(dep.age).to.be.eq(22);
        chai.expect(dep.name).to.be.eq('TestClass2');
        chai.expect(dep.testMethod()).to.be.eq('testMethodResult2');
    });
    it('Injectable with no explicit identifier', () => {
        @Injectable([])
        class TestClass {
            public myProperty = 'test_value';
        }

        const instance = di.Get(TestClass);
        chai.expect(instance instanceof TestClass).to.be.eq(true);
        chai.expect(instance.myProperty).to.be.eq('test_value');
    })
    it('Injectable with deps created with createDependencyToken', () => {
        class Dep1 {
            myMethod() {
                return 'test';
            }
        }
        const dep1Token = createDependencyToken('Dep1', Dep1);
        di.Register(dep1Token, {
            class: Dep1
        });
        @Injectable([dep1Token])
        class TestClass {
            constructor(private dep1: InstanceType<typeof dep1Token.type>) {
            }
            testMethod() {
                return this.dep1.myMethod();
            }
        }

        const testClass = di.Get(TestClass);
        chai.expect(testClass instanceof TestClass).to.be.eq(true);
        chai.expect(testClass.testMethod()).to.be.eq('test');
    });
    it('Injectable with a string identifier', () => {
        @Injectable('TEST_CLASS')
        class TestClass {
            testMethod() {
                return 'Boo! There is nothing to fear. - Paavo Lipponen';
            }
        }
        const testClass = di.Get('TEST_CLASS');
        chai.expect(testClass instanceof TestClass).to.be.eq(true);
        chai.expect(testClass.testMethod()).to.be.eq('Boo! There is nothing to fear. - Paavo Lipponen');
    });
    it('Injectable class as token with undefined dependencies', () => {
        @Injectable()
        class TestClass {
            testMethod() {
                return 'Undefined Dependencies';
            }
        }

        const testClass = di.Get(TestClass);
        chai.expect(testClass instanceof TestClass).to.be.eq(true);
        chai.expect(testClass.testMethod()).to.be.eq('Undefined Dependencies');
    });
    it('Inject should instantiate the class succesfully', () => {
        @Injectable([])
        class Logger {
            log(msg: string) {
                return msg;
            }
        }

        class ConsumingClass {
            constructor(private logger: Logger) {}

            testMethod() {
                this.logger.log('testMethod called');
                return true;
            }
        }

        const consumingClass = Inject(ConsumingClass, [Logger])();

        chai.expect(consumingClass instanceof ConsumingClass).to.be.eq(true);
        chai.expect(consumingClass.testMethod()).to.be.eq(true);
    });
})