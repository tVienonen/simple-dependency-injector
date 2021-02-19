import { Injectable } from "../../src";
import DependencyClass from './dependencyFile';


@Injectable([DependencyClass])
class DependentClass {
    constructor (public dependencyClass: DependencyClass) {}
}

export default DependentClass;