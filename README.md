# Simple Dependency Injector

This package contains a simple implementation for a dependency container and an injector. Dependency container is singleton object that contains the registered dependencies. After registering dependencies to the container the user can fetch a dependency with a dependency token.

## Usage

1. Write your dependency injectable class or value (function, primitive, plain object)

```javascript
// Example with decorator syntax
import { Injectable } from 'deeai';
import { LOGGER, MYCLASS } from './dependencyTokens';

// First argument to the Injectable decorator factory function is the identifier of the Class to be registered.
// Rest of the arguments are identifiers of the dependencies of the class
// When the injector is resolving MyClass it will throw an error if LOGGER dependency is not registered to the container.
@Injectable(MYCLASS, LOGGER)
class MyClass {
    // Dependencies will be injected to the constructor in the order they are applied to the Injectable decorator.
    constructor(loggerInstance) {
        this.logger = loggerInstance;
    }
}
```

2. Register your dependencies at application startup

```javascript
// boot.js
// Make sure you import this file as soon as possible in your application's lifecycle
// if you used the decorator syntax you can just do an empty import from the file
import './myclass';
import './logger';

// OR if you don't want to use decorators you can manually register the dependencies with the dependency container's API
import di from 'deeai';
import MyClass from './myclass';
import Logger from './logger';
import { MYCLASS, LOGGER } from './dependencyTokens';

di.Register(MYCLASS, {
    class: MyClass,
    deps: [LOGGER]
});
di.Register(LOGGER, {
    class: Logger,
    deps: []
});
```

3. Getting the dependencies

```javascript
// In your application's business logic
// Import the dependency injector
import di from 'deeai';
import { LOGGER, MYCLASS } from './dependencyTokens';

const logger = di.Get(LOGGER);
const myClass = di.Get(MYCLASS);


function handleEvent(data) {
    // Use instances of injected dependencies
    logger.debug('Received event from stream: ', data);
    myClass.doMyClassStuff();
}
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