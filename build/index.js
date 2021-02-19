"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Inject = exports.Injectable = exports.createDependencyToken = void 0;
function createDependencyToken(dependencyName, type) {
    return {
        tokenName: dependencyName,
        type
    };
}
exports.createDependencyToken = createDependencyToken;
const DependencyInjectorContainer = {};
/**
 * Internal use only
 * @type {Map<any, any>}
 */
DependencyInjectorContainer._dependencies = new Map();
/**
 * Manually register a dependency into the container
 */
DependencyInjectorContainer.Register = (identifier, options) => {
    if (!options) {
        throw new Error('No options provided!');
    }
    if (options.deps) {
        if (!Array.isArray(options.deps)) {
            throw new Error(`Expected options.deps to be an array when it was ${typeof options.deps}`);
        }
    }
    let _identifier = identifier;
    if (identifier != null && typeof identifier !== 'string' && 'tokenName' in identifier) {
        _identifier = identifier.tokenName;
    }
    if (DependencyInjectorContainer._dependencies.has(_identifier)) {
        // @ts-ignore
        console.warn('Dependency was already registered. Make sure you wanted to overwrite an existing dependency!');
    }
    DependencyInjectorContainer._dependencies.set(_identifier, options);
};
/**
 * Get a registered dependency from the container
 */
DependencyInjectorContainer.Get = (identifier) => {
    let _identifier = identifier;
    if (identifier != null && typeof identifier !== 'string' && 'tokenName' in identifier) {
        _identifier = identifier.tokenName;
    }
    const depOptions = DependencyInjectorContainer._dependencies.get(_identifier);
    if (!depOptions) {
        throw new Error(`No dependency registered for this identifier: ${_identifier}`);
    }
    if (depOptions.value) {
        return depOptions.value;
    }
    let resolvedDeps = [];
    if (depOptions.deps) {
        for (let requiredDep of depOptions.deps) {
            resolvedDeps.push(DependencyInjectorContainer.Get(requiredDep));
        }
    }
    if (depOptions.factory) {
        depOptions.value = depOptions.factory.call(null, ...resolvedDeps);
    }
    else if (depOptions.class) {
        depOptions.value = new depOptions.class(...resolvedDeps);
    }
    return depOptions.value;
};
/**
 * Eagerly resolves the identifiers
 */
DependencyInjectorContainer.EagerResolve = (...identifiers) => {
    for (const id of identifiers) {
        DependencyInjectorContainer.Get(id);
    }
};
/**
 * Clears the dependency container. Used in testing.
 */
DependencyInjectorContainer._restoreContainer = () => {
    DependencyInjectorContainer._dependencies = new Map();
};
exports.default = DependencyInjectorContainer;
function Injectable(identifier, ...deps) {
    return (target) => {
        if (Array.isArray(identifier) || identifier === undefined) {
            DependencyInjectorContainer.Register(target, {
                class: target,
                deps: identifier
            });
        }
        else {
            DependencyInjectorContainer.Register(identifier, {
                class: target,
                deps
            });
        }
    };
}
exports.Injectable = Injectable;
;
/**
 * Inject dependencies to a class
 * @param target Target class to inject dependencies to
 * @param deps List of dependencies that are registered to the Dependency container
 *
 * @returns a factory function which when called instantiates the class with resolved dependencies.
 */
function Inject(target, deps) {
    return function () {
        const args = [];
        for (const dep of deps) {
            if (typeof dep === 'string') {
                args.push(DependencyInjectorContainer.Get(dep));
            }
            else if (dep != null && 'tokenName' in dep) {
                args.push(DependencyInjectorContainer.Get(dep));
            }
            else {
                args.push(DependencyInjectorContainer.Get(dep));
            }
        }
        return new target(...args);
    };
}
exports.Inject = Inject;
//# sourceMappingURL=index.js.map