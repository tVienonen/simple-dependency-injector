export declare type Dependency = string | DependencyToken | (new (...args: any[]) => any);
export interface DependencyToken<T = any> {
    tokenName: string;
    type: T;
}
export declare function createDependencyToken<T = any>(dependencyName: string, type: T): DependencyToken<T>;
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
declare const DependencyInjectorContainer: IDependencyInjectorContainer;
export default DependencyInjectorContainer;
/**
 * Registers target class to the dependency container
 *
 * Passes the listed dependencies to the constructor of the class
 * @param deps Dependencies of the injectable target (constructor parameters)
 */
export declare function Injectable<T extends new (...args: any[]) => any>(deps?: Dependency[]): any;
/**
 * Registers target class to the dependency container
 *
 * Passes the listed dependencies to the constructor of the class
 * @param identifier explicit identifier for the class used when getting the resolved instance
 * @param deps Dependencies of the injectable target (constructor parameters)
 */
export declare function Injectable<T extends new (...args: any[]) => any>(identifier: string, ...deps: Dependency[]): any;
/**
 * Registers target class to the dependency container
 *
 * Passes the listed dependencies to the constuctor of the class
 * @param token DependencyToken created with createDependencyToken()
 * @param deps Dependencies of the injectable target (constructor parameters)
 */
export declare function Injectable<T extends new (...args: any[]) => any>(token: DependencyToken, ...deps: Dependency[]): any;
/**
 * Inject dependencies to a class
 * @param target Target class to inject dependencies to
 * @param deps List of dependencies that are registered to the Dependency container
 *
 * @returns a factory function which when called instantiates the class with resolved dependencies.
 */
export declare function Inject<T extends new (...args: any[]) => any>(target: T, deps: (string | DependencyToken | (new (...args: any[]) => any))[]): () => InstanceType<T>;
//# sourceMappingURL=index.d.ts.map