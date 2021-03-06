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

import { examplesQueries } from './actions';
import { selectExamples } from './selectors';
import { DataList,
         DataSelect,
         DataTable,
         DefList,
         ListItem } from '../GenericDisplay/component';
import { dataContainerFor } from '../DataContainer/component';
import { connectWithApiQuery } from '../APIWrapper';

import React from 'react';

// Maps all data fields in Example objects to their display names.
export const EXAMPLE_FIELD_MAP = [
    ['id', 'Example Id'],
    ['text', 'Text'],
    ['frameType', 'Frame Type'],
];
export const EXAMPLE_ALL_FIELDS = EXAMPLE_FIELD_MAP.map(entry => entry[0]);

// Display components for individual examples:

// props:
//   data :: DataObject, an example 
// className and extras props, if given, will be passed on to ListItem
function ExampleAsListItem(props) {
    // examples do not always have a frame type; don't display the ndash
    // if this one doesn't:
    const frameTypeWithDash = props.data.frameType
          ? props.data.frameType + " \u2013 " // &ndash;
          : null;

    return (
        <ListItem key={props.data.id}
                  className={props.className}
                  extras={props.extras}>
          {frameTypeWithDash} {props.data.text}  
        </ListItem>
    );
}

// Display components for an array of example objects:

// props:
//   data :: [ DataObject ], the examples
function ExamplesAsDefList(props) {
    const terms = props.data.map( d => d.frameType );
    const defs = props.data.map( d => d.text );
    return (
          <DefList className="examples-container" terms={terms} defs={defs}/>
    );
}


// props:
//   data :: [ DataObject ], the examples
//   ordered (optional) :: Bool, whether the list should be ordered or unordered
//   displayItemAs (optional) :: Component to render an example as a list item
//      Defaults to ExampleAsListItem
//      Data container control props (.choose, etc.), if given, will be passed on
//      to this component.
// Other props will also be passed on to DataList, including:
//   className, extras, itemClassName, itemExtras   
function ExamplesAsList(props) {
    return (
        <DataList {...props} displayItemAs={props.displayItemAs || ExampleAsListItem} />
    );
}


// props:
//   data :: [ DataObject ], the examples 
//   fieldMap (optional) :: [ [String, String] ], maps example field names to their display names
//   displayFields (optional) :: [ String ], the field names to be displayed
//   displayItemAs (optional) :: Component to render an example as a table row
//      Defaults to DataTableRow.
//      Data container control props (.choose, etc.), if given, will be passed on
//      to this component.
// Other props will also be passed on to DataTable, including:
//   className, extras
//   headClassName, headExtras
//   bodyClassName, bodyExtras 
function ExamplesAsTable(props) {
    return (
        <DataTable {...props}
                   fieldMap={props.fieldMap || EXAMPLE_FIELD_MAP}
                   displayFields={props.displayFields || EXAMPLE_ALL_FIELDS} />
    );
}
 
// props:
//   queryParams :: { lexUnitId: ... }
var ExamplesContainer = dataContainerFor('Examples', selectExamples);
ExamplesContainer = connectWithApiQuery(ExamplesContainer, examplesQueries.queryActions);

export { ExamplesContainer,
         ExamplesAsDefList,
         ExamplesAsList,
         ExamplesAsTable }; 

