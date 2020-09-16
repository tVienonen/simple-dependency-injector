export interface DependencyDefinition<T = any> {
    deps?: string[];
    factory?: (...deps: string[]) => T;
    value?: T;
    class?: new (...args: any[]) => T;
}
export interface IDependencyInjectorContainer {
    _dependencies: Map<string, DependencyDefinition>;
    _restoreContainer: () => void;
    Register: (identifier: string, options: DependencyDefinition) => void;
    Get: <T = any>(identifier: string) => T;
    EagerResolve: (...identifiers: string[]) => void;
}
declare const DependencyInjectorContainer: IDependencyInjectorContainer;
export default DependencyInjectorContainer;
export declare const Injectable: <T extends new (...args: any[]) => any>(identifier: string, ...deps: string[]) => (target: T) => void;
export declare const Inject: <T extends new (...args: any[]) => any>(...identifiers: string[]) => (target: T) => {
    (): any;
    prototype: any;
};
