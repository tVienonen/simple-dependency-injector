
import { Injectable } from "../../src";

@Injectable([])
class DependencyClass {
    mySpecialMethod() {
        return 'mySpecialMethod';
    }
}

export default DependencyClass;
