// Copyright 2019 Richard Lawrence
//
// This file is part of germanet-common.
//
// germanet-common is free software: you can redistribute it and/or modify
// it under the terms of the GNU Lesser General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// germanet-common is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public License
// along with germanet-common.  If not, see <https://www.gnu.org/licenses/>.

// helpers.js
// Some useful helper functions for dealing with react and redux components in this library
import { InternalError } from './errors';

import SI from 'seamless-immutable';

// actionTypesFromStrings :: [ String ] -> Object
// Given an array of strings, returns an object using those strings as field names.
// This object can be used to represent a set of action types.
export function actionTypesFromStrings (strs) {
    var types = {};
    strs.forEach(function(key) {
        types[key] = key;
    });

    return types;
}

// mergeActionTypes :: Object -> Object -> Object
export function mergeActionTypes(typesA, typesB) {
    return { ...typesA, ...typesB };
}

// upperFirst :: String -> String
export function upperFirst(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
}

// withNullAsString :: Object -> String
// params:
//   data: the data to convert to a string
//   nullString (optional): the string to use for null values
// Returns data as a string, unless data is null or undefined, in
// which case it returns nullString.  This is needed because
// .toString() raises a TypeError on null or undefined, which have no
// properties.
export function withNullAsString(data, nullString = '') {
    if (data == null || data == undefined) {
        return nullString;
    }
    else {
        return data.toString();
    }
}

// isVisible :: DOM Node -> Bool
// Borrowed from jQuery; see https://stackoverflow.com/questions/19669786/check-if-element-is-visible-in-dom
export function isVisible(elem) {
    return !!( elem.offsetWidth || elem.offsetHeight || elem.getClientRects().length );
}


// makeByIdReducer
//
// Creates a reducer that can manage the state for a dynamic list of
// components based on their IDs.  That is, given a reducer which
// manages state that looks like { foo: fooVal, ...}, this
// function creates a reducer which manages state that looks like:
// { byId: {
//      idA: { foo: fooVal, ... },
//      idB: { foo: fooVal, ... },
//      ...
//   }
// }
//           
// The returned reducer assumes that IDs are unique within the state
// tree that it manages, and that an .id field is included on all of
// the actions it handles.  Based on that .id, it routes the
// corresponding slice of state to the given reducer (first
// initializing it if necessary), and updates the state tree with the
// return value.  Thus, the given reducer is called *exactly once* per
// action handled.
//
// Parameters:
//   innerReducer: reducer function that manages internal slices of state 
//   innerActions: an action types object that specifies the action types the
//     innerReducer can handle. Important: these actions are *required* to have
//     an .id field whenever they are emitted!
//   initialSharedState (optional): a Seamless Immutable object that represents
//     an initial state tree for the returned reducer to manage.  The byId object
//     will become a property of this object.
//     
export function makeByIdReducer(innerReducer,
                                innerActions,
                                initialSharedState = SI({})) {
    return function (state = initialSharedState, action) {
        const componentId = action.id;
        var initializedState = state;

        // any actions other than those in innerActions are not
        // handled by us and should return the original state
        // unchanged:
        if (!(action.type in innerActions)) {
            return state;
        }

        if (componentId === undefined) {
            throw new InternalError(`${action.type} was emitted with an undefined .id`);
        }
        
        // initialize a slice of state corresponding to the given
        // ID if it doesn't yet exist
        if ((state.byId === undefined) ||
            !(componentId in state.byId)) {
            // redux reducers are required to return a default
            // state if given an undefined state, so we use that to get
            // the default state handled by the inner reducer; see 
            // https://redux.js.org/basics/reducers
            // https://redux.js.org/api/combinereducers
            const defaultInnerState = innerReducer(undefined,
                                                   // dummy action type:
                                                   { type: '_DEFAULT_STATE_PROBE' }); 
            
            initializedState = SI.setIn(state, ['byId', componentId],
                                        defaultInnerState);
        }
            
        // pass the appropriate slice of the initialized state on
        // to the innerReducer, and let it handle the action
        const oldInnerState = initializedState.byId[componentId];
        return SI.setIn(initializedState, ['byId', componentId],
                        innerReducer(oldInnerState, action));

    }
}

// makeBroadcastingReducer
//
// Creates a reducer that "broadcasts" actions which can potentially
// update multiple parts of a state tree that looks like:
//
// { byId: {
//      idA: { foo: fooVal, ... },
//      idB: { foo: fooVal, ... },
//      ...
//   }
// }
//           
// given a reducer which handles a state like { foo: fooVal, ...}.
//
// The given reducer is called with the action to be handled and the
// slice of state corresponding to a particular id for *every* id that
// already exists in the state tree.  Thus, the given reducer will be
// called *as many times as there are IDs*.
//
// This provides a complementary pattern to the type of reducer
// returned by makeByIdReducer.  Use makeByIdReducer to handle actions
// where you know, at the time you generate the action, the ID for the
// slice of the state tree it should update.  Use this function to
// handle actions that might need to update the tree in multiple
// places, or where the ID of the slice of state that needs to be
// updated is not known at the point where the action is generated.
//
// Parameters:
//   innerReducer: reducer function that manages internal slices of state 
//   innerActions: an action types object that specifies the action types the
//     innerReducer can handle. 
//
export function makeBroadcastingReducer(innerReducer, innerActions) {
    return function (state = SI({}), action) {

        // any actions other than those in innerActions are not handled by us;
        // and if there is not yet an internal state tree, there's nothing to do.
        if (!(action.type in innerActions) || 
            (state.byId === undefined)) {    
            return state;
        }

        // for actions we should handle, create a new state by
        // iterating over all the slices of the .byId property and
        // letting the innerReducer return an updated state for that
        // slice:
        var newState = state;
        
        // Object.getOwnPropertyNames ensures we only iterate over the
        // actual IDs and not property names elsewhere in the
        // prototype chain
        Object.getOwnPropertyNames(state.byId).forEach( id => {
            newState = SI.setIn(newState, ["byId", id],
                                innerReducer(state.byId[id], action));
            })
                                                        
        return newState;
    }
}

               
       
// debugResponse :: Response ->
// can drop this onto Promise objects to debug errors in server responses
// e.g. axios.get(...).then(...).catch(debugResponse);
function debugResponse(error) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
        console.log(error.response.data);
        console.log(error.response.status);
        console.log(error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
      // http.ClientRequest in node.js
        console.log(error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
        console.log('Error', error.message);
    }
    console.log(error.config);

}