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

import { actionTypesFromStrings } from '../../helpers';
import { APIError, isArrayOfObjects } from './validation';
import { gcAxiosInstance as axios } from '../../constants';

// Makes action types and action creators for querying data at an API endpoint
//
// params:
//   prefix :: String : used to name action types
//   endpoint :: String : the URL for the query
//   paramsTransformer (optional) :: params -> Object : a function
//     that transforms API request params into action object
//     fields. The results of paramsTransformer(params) will be
//     spliced into action objects returned by the returned action
//     creators.
//   dataValidator (optional) :: response data -> <anything> : a
//     function that validates the data attribute of the response
//     (i.e., response.data.data). This function should accept the
//     data and throw an APIError (see validation.js) if the data is
//     not in the right format. Otherwise, it should return validated
//     data, which will be dispatched with the action creator for the
//     returned data. Defaults to a function that checks whether the
//     data is an array of objects.
//
// returns: {
//   actionTypes: action types object with requested, returned, error types
//   queryActions: {
//     doQuery(params): async action creator that performs complete request/response cycle
//     requested(params): action creator for request
//     returned(params, data): action creator for returned data
//     error(params): action creator for response error
//       where params is an object describing (axios) request parameters for the API, e.g.,
//       { id: some_id } or { lexUnitId: some_id }
//   }
// }
export function makeQueryActions(prefix, endpoint,
                                 paramsTransformer,
                                 dataValidator) {

    const transformer = paramsTransformer || function (params) { return undefined; }
    const validateData = dataValidator || isArrayOfObjects;

    const requested = prefix + '_REQUESTED';
    const returned = prefix + '_RETURNED';
    const errored = prefix + '_QUERY_ERROR';
    const actionTypes = actionTypesFromStrings([
        requested,
        returned,
        errored
    ]);

    function queryRequested(params) {
        return { type: actionTypes[requested], params, ...transformer(params) };
    }
    function queryReturned(params, data) {
        return { type: actionTypes[returned], params, ...transformer(params), data };
    }
    function queryError(params, error) {
        return { type: actionTypes[errored], params, ...transformer(params), error };
    }

    function doQuery(params) {
        return function (dispatch) {
            const config = { params };
            dispatch(queryRequested(params));

            function validateResponse(response) {
                if (!(response.data && response.data.data)) {
                    dispatch(queryError(params, 'Server returned a response with no data field'));
                } 

                try {
                    const validData = validateData(response.data.data);
                    dispatch(queryReturned(params, validData));
                } catch (e) {
                    if (e instanceof APIError) {
                        dispatch(queryError(params, e.message));
                    } else {
                        throw e;
                    }
                }
            }

            return axios.get(endpoint, config).then(
                validateResponse, 
                err => dispatch(queryError(params, err)));
        }
    }

    return {
        actionTypes,
        queryActions: {
            doQuery,
            requested: queryRequested,
            returned: queryReturned,
            error: queryError,
        }
    };
}


