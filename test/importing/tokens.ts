import { createDependencyToken } from '../../src/index';
import TokenizedDependency from './dependencyFileToken';

export const TokenForTokenizedDependency = createDependencyToken('TOKENIZED_DEPENDENCY', TokenizedDependency);