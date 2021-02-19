# Simple Dependency Injector

This package contains a simple implementation for a dependency container and an injector. Dependency container is singleton object that contains the registered dependencies. After registering dependencies to the container the user can fetch a dependency with a dependency token.

## Usage with classes (Recommended way)

1. Implement your dependency class first

```typescript
// logger.ts
import { Injectable } from 'deeai';

@Injectable()
class Logger {
    log() {
        // writes to log
    }
}

export default Logger;
```

2. Then implement your dependent class
```typescript
// my-service.ts
import { Injectable } from 'deeai';
import { Logger } from './logger';

@Injectable([Logger])
class MyService {
    constructor (private logger: Logger) {}

    doServiceStuff() {
        this.logger.log('Doing service stuff');
        // ...
    }
}

export default MyService;
```
3. Then in your code where you need the service.

```typescript
// main.ts
import di from 'deeai';
import MyService from './my-service';

function main() {
    // myService will be an instance of MyService
    // Note: Dependencies will only be instantiated once
    // they will be singletons essentially
    const myService = di.Get(Myservice);
    myService.doServiceStuff();
}
```

**Note: For more usage examples have a look at the test folder in the git repository**

## Dependency identifiers

Dependency identifiers are used to match the identier to a dependency that is registered to the dependency container.

### Identifier types

There are three types of identifiers: Classes, plain old strings and dependency tokens.

**Classes**

Classes are the recommended method. Dependency container will use the class as an identifier for the dependency. When using classes it is recommended to use the Injectable decorator.

```typescript
import { Injectable } from 'deeai';
import DependencyOfMyDependency from './dep1';

@Injectable([DependencyOfMyDependency])
class MyDependency {
    constructor (private dep: DependencyOfMyDependency) {}
    complexLogic() {
        // ...
    }
}

export default MyDependency;
```

If you are not using decorators you can just use the decorator as a function. This has the same effect as above.
```typescript
// Same file as above but different way of registerin the dependency
import { Injectable } from 'deeai';
import DependencyOfMyDependency from './dep1';

class MyDependency {
    constructor (private dep: DependencyOfMyDependency) {}
    complexLogic() {
        // ...
    }
}

Injectable([DependencyOfMyDependency])(MyDependency);

export default MyDependency;
```
**Strings**

Using strings is simple you just associate a string value with a dependency.

```typescript
import di from 'deeai';
import DependencyClass from './dependencyClass';


di.Register('MY_DEPENDENCY', {
    class: DependencyClass,
    deps: ['DEPENDENCY_OF_MY_DEPENDENCY'] // Example. Dependencies need to be also registered before calling Get()
});

const dep = di.Get('MY_DEPENDENCY');
```

The disadvantage is that you will not have type resolution when using string identifiers. You will only get the any type when calling Get().

**Dependency tokens**

Dependency tokens are similar to strings but you can use them to associate a type with the identifier.

```typescript
import { createDependencyToken } from 'deeai';

const myDep = {
    config: {
        language: 'us'
    }
};

export const token = createDependencyToken('MY_DEP', myDep);

// somewhere else in the project
import di from 'deeai';
import { token } from './my-dep';

di.Register(token, {
    // if type pointed to by the token is a value use value property.
    // Otherwise use class or factory
    value: token.type
});

const myDep = di.Get(token);
// myDep is now typed properly
```
## Dependency injector's item variants

There are 3 different things you can register to the dependency injector. The variant of the item is specified in the Injectable's second argument or as a name of a field in the Register method's options object.

The three variants are:
- class
- factory
- value

Class is just a plain old ES6 class. The dependencies will be injected to the classes constructor. The class will be instantiated when it is requested from the dependency container for the first time.

Factory is a factory function that is used to create the injectable value. Dependencies will be applied to the factory function when the injected value is first requested.

Value is just a value that will be bound to the token that it is registered with.

### Register method's options object

The structure of the options object is as follows:
```javascript
const variant = 'factory' // one of 'class'|'factory'|'value'

const options = {
    [variant]: MyClass,
    deps: [LOGGER]
}
```

## Eagerly resolving dependencies
If you want to resolve depencies eagerly before they are actually needed you call the EagerResolve method of the dependency injector.
```javascript
import di from 'deeai';
import { LOGGER } from './dependencyTokens';

// LOGGER still has to be registered before trying to resolve it.
di.EagerResolve(LOGGER);
// LOGGER is now instantiated in the container.
```