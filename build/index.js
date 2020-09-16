"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Inject = exports.Injectable = void 0;
const DependencyInjectorContainer = {};
/**
 * Internal use only
 * @type {Map<string, any>}
 */
DependencyInjectorContainer._dependencies = new Map();
/**
 * Register a dependency into the container
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
    if (DependencyInjectorContainer._dependencies.has(identifier)) {
        // @ts-ignore
        console.warn('Dependency was already registered. Make sure you wanted to overwrite an existing dependency!');
    }
    DependencyInjectorContainer._dependencies.set(identifier, options);
};
/**
 * Get a registered dependency from the container
 */
DependencyInjectorContainer.Get = identifier => {
    const depOptions = DependencyInjectorContainer._dependencies.get(identifier);
    if (!depOptions) {
        throw new Error(`No dependency registered for this identifier: ${identifier}`);
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
exports.Injectable = (identifier, ...deps) => {
    return (target) => {
        DependencyInjectorContainer.Register(identifier, {
            class: target,
            deps
        });
    };
};
exports.Inject = (...identifiers) => {
    return (target) => {
        let args = null;
        // Overrides the constructor of the target class
        // If class is called without any arguments then dependency injection will
        // inject the dependencies to the class constructor
        // Otherwise the arguments will be used in the constructor
        const overriden = function () {
            if (args === null && arguments.length === 0) {
                args = [];
                for (const identifier of identifiers) {
                    args.push(DependencyInjectorContainer.Get(identifier));
                }
            }
            return new target(...(arguments.length ? arguments : args));
        };
        overriden.prototype = target.prototype;
        return overriden;
    };
};
//# sourceMappingURL=index.js.map