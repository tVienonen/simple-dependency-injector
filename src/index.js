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

export default DependencyInjectorContainer;

export const Injectable = (identifier, variant, ...deps) => {
  return target => {
    DependencyInjectorContainer.Register(identifier, {
      [variant]: target,
      deps
    });
  };
};
