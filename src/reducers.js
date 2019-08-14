// reducers.js
// Re-export component-specific reducers here for convenient import in
// consuming applications
import { combineReducers } from 'redux';

export { synsetSearchBoxes } from './components/SynsetSearch/reducers';

// Data containers
export { dataContainers } from './components/DataContainer/reducers';

// API
import { conRels } from './components/ConRels/reducers';
import { iliRecs } from './components/ILIRecords/reducers';
import { lexExamples } from './components/LexExamples/reducers';
import { lexRels } from './components/LexRels/reducers';
import { lexUnits } from './components/LexUnits/reducers';
import { wiktDefs } from './components/WiktionaryDefs/reducers';

// a reducer to handle every component that's connected with the API:
const fullAPIReducer = combineReducers({
    conRels,
    iliRecs,
    lexExamples,
    lexRels,
    lexUnits,
    wiktDefs,
})

export { fullAPIReducer as apiData };
