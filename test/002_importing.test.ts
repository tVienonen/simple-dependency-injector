import di from '../src';
import DependentClass from './importing/dependentFile';
import { TokenForTokenizedDependency } from './importing/tokens';
import chai from 'chai';

describe('importing', () => {
    it('injection & registering works for classes in different modules', () => {
        const dependentClass = di.Get(DependentClass);
        chai.expect(dependentClass instanceof DependentClass).to.be.eq(true);
        chai.expect(dependentClass.dependencyClass.mySpecialMethod()).to.be.eq('mySpecialMethod');
    });
    it('tokenized dependency', () => {
        di.Register(TokenForTokenizedDependency, {
            class: TokenForTokenizedDependency.type
        });

        const tokenizedDependencyInstance = di.Get(TokenForTokenizedDependency);

        chai.expect(tokenizedDependencyInstance instanceof TokenForTokenizedDependency.type).to.be.eq(true);
        chai.expect(tokenizedDependencyInstance.specialDependentMethod()).to.be.eq('I am special');
    });
})