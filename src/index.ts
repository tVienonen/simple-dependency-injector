export interface DependencyDefinition<T = any> {
  deps?: string[];
  factory?: (...deps: string[]) => T;
  value?: T;
  class?: new (...args: any[]) => T
}

export interface IDependencyInjectorContainer {
  _dependencies: Map<string, DependencyDefinition>;
  _restoreContainer: () => void;
  Register: (identifier: string, options: DependencyDefinition) => void;
  Get: <T = any>(identifier: string) => T;
  EagerResolve: (...identifiers: string[]) => void;
}

const DependencyInjectorContainer = {} as IDependencyInjectorContainer;

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
  } else if (depOptions.class) {
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
}

export default DependencyInjectorContainer;

export const Injectable = <T extends new (...args: any[]) => any>(identifier: string, ...deps: string[]) => {
  return (target: T) => {
    DependencyInjectorContainer.Register(identifier, {
      class: target,
      deps
    });
  };
};

export const Inject = <T extends new (...args: any[]) => any>(...identifiers: string[]) => {
  return (target: T) => {
    let args = null as any;
    // Overrides the constructor of the target class
    // If class is called without any arguments then dependency injection will
    // inject the dependencies to the class constructor
    // Otherwise the arguments will be used in the constructor
    const overriden = function() {
      if (args === null && arguments.length === 0) {
        args = [];
        for (const identifier of identifiers) {
          args.push(DependencyInjectorContainer.Get(identifier));
        }
      }
      return new target(...(arguments.length ? arguments : args));
    }
    overriden.prototype = target.prototype;

    return overriden;
  }
}
