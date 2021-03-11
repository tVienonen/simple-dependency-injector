export type Dependency = string|DependencyToken|(new (...args: any[]) => any);

export interface DependencyToken<T = any> {
  tokenName: string;
  type: T
}

export function createDependencyToken<T = any>(dependencyName: string, type: T) {
  return {
    tokenName: dependencyName,
    type
  } as DependencyToken<T>;
}

export interface DependencyDefinition<T = any> {
  deps?: Dependency[];
  factory?: (...deps: any[]) => T;
  value?: T;
  class?: new (...args: any[]) => T;
}

export interface IDependencyInjectorContainer {
  _dependencies: Map<any, DependencyDefinition>;
  _restoreContainer: () => void;
  Register<T = any>(dependencyToken: DependencyToken<T>, options: DependencyDefinition<any>): void;
  Register<T extends new (...args: any[]) => any>(identifier: T, options: DependencyDefinition<T>): void;
  Register<T = any>(identifier: string, options: DependencyDefinition<T>): void;
  Get<T extends new (...args: any[]) => any>(identifier: T): InstanceType<T>;
  Get<T = any>(identifier: DependencyToken<T>): typeof identifier.type extends new (...args: any[]) => any ? InstanceType<typeof identifier.type> : typeof identifier.type;
  Get<T = any>(identifier: string): T;
  EagerResolve: (...identifiers: Dependency[]) => void;
}

const DependencyInjectorContainer = {} as IDependencyInjectorContainer;

/**
 * Internal use only
 * @type {Map<any, any>}
 */
DependencyInjectorContainer._dependencies = new Map();
/**
 * Manually register a dependency into the container
 */
DependencyInjectorContainer.Register = (identifier: Dependency, options: DependencyDefinition) => {
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
    _identifier = identifier.tokenName
  }
  if (DependencyInjectorContainer._dependencies.has(_identifier as string)) {
    // @ts-ignore
    console.warn('Dependency was already registered. Make sure you wanted to overwrite an existing dependency!');
  }
  DependencyInjectorContainer._dependencies.set(_identifier as string, options);
};
/**
 * Get a registered dependency from the container
 */
DependencyInjectorContainer.Get = <T extends new (...args: any[]) => any>(identifier: string|DependencyToken|T) => {
  let _identifier = identifier;
  if (identifier != null && typeof identifier !== 'string' && 'tokenName' in identifier) {
    _identifier = identifier.tokenName
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
      resolvedDeps.push(DependencyInjectorContainer.Get(requiredDep as any));
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
    DependencyInjectorContainer.Get(id as any);
  }
};
/**
 * Clears the dependency container. Used in testing.
 */
DependencyInjectorContainer._restoreContainer = () => {
  DependencyInjectorContainer._dependencies = new Map();
}

export default DependencyInjectorContainer;
/**
 * Registers target class to the dependency container
 * 
 * Passes the listed dependencies to the constructor of the class
 * @param deps Dependencies of the injectable target (constructor parameters)
 */
export function Injectable<T extends new (...args: any[]) => any>(deps?: Dependency[]): any;
/**
 * Registers target class to the dependency container
 * 
 * Passes the listed dependencies to the constructor of the class
 * @param identifier explicit identifier for the class used when getting the resolved instance
 * @param deps Dependencies of the injectable target (constructor parameters)
 */
export function Injectable<T extends new (...args: any[]) => any>(identifier: string, ...deps: Dependency[]): any;
/**
 * Registers target class to the dependency container
 * 
 * Passes the listed dependencies to the constuctor of the class
 * @param token DependencyToken created with createDependencyToken()
 * @param deps Dependencies of the injectable target (constructor parameters) 
 */
export function Injectable<T extends new (...args: any[]) => any>(token: DependencyToken, ...deps: Dependency[]): any;
export function Injectable<T extends new (...args: any[]) => any>(identifier?: string|DependencyToken|Dependency[], ...deps: Dependency[]) {
  return (target: T) => {
    if (Array.isArray(identifier) || identifier === undefined) {
      DependencyInjectorContainer.Register(target, {
        class: target,
        deps: identifier
      });
    } else {
      DependencyInjectorContainer.Register(identifier, {
        class: target,
        deps
      });
    }
  };
};

/**
 * Inject dependencies to a class
 * @param target Target class to inject dependencies to
 * @param deps List of dependencies that are registered to the Dependency container
 * 
 * @returns a factory function which when called instantiates the class with resolved dependencies.
 */
export function Inject<T extends new (...args: any[]) => any>(target: T, deps: (string|DependencyToken|(new (...args: any[]) => any))[]) {
  return function(): InstanceType<T> {
    const args = [];
    for (const dep of deps) {
      if (typeof dep === 'string') {
        args.push(DependencyInjectorContainer.Get(dep));
      } else if (dep != null && 'tokenName' in dep) {
        args.push(DependencyInjectorContainer.Get(dep));
      } else {
        args.push(DependencyInjectorContainer.Get(dep));
      }
    }
    return new target(...args);
  }
}
