import { createStore } from 'redux';
import { combinedReducer } from './reducers';
const buildStore = createStore.bind(null, combinedReducer, undefined, window && window.devToolsExtension && window.devToolsExtension())
const store = buildStore();


export {
  store,
  buildStore,
};
