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

import { framesQueries } from './actions';
import { selectFrames } from './selectors';
import { DataList,
         DataSelect,
         DataTable,
         DefList,
         ListItem } from '../GenericDisplay/component';
import { dataContainerFor } from '../DataContainer/component';
import { connectWithApiQuery } from '../APIWrapper';

import React from 'react';

// Maps all data fields in Frame objects to their display names.
export const FRAME_FIELD_MAP = [
    ['id', 'Frame Id'],
    ['frameType', 'Frame Type'],
];
export const FRAME_ALL_FIELDS = FRAME_FIELD_MAP.map(entry => entry[0]);

// Display components for individual frames:

// props:
//   data :: DataObject, a frame 
// className and extras props, if given, will be passed on to ListItem
function FrameAsListItem(props) {
    return (
        // TODO: is this a reasonable default?
        <ListItem key={props.data.id}
                  className={props.className}
                  extras={props.extras}>
          {props.data.frameType}
        </ListItem>
    );
}

// Display components for an array of frame objects:

// props:
//   data :: [ DataObject ], the frames
//   ordered (optional) :: Bool, whether the list should be ordered or unordered
//   displayItemAs (optional) :: Component to render an frame as a list item
//      Defaults to FrameAsListItem
//      Data container control props (.choose, etc.), if given, will be passed on
//      to this component.
// Other props will also be passed on to DataList, including:
//   className, extras, itemClassName, itemExtras   
function FramesAsList(props) {
    return (
        <DataList {...props} displayItemAs={props.displayItemAs || FrameAsListItem} />
    );
}


// props:
//   data :: [ DataObject ], the frames 
//   fieldMap (optional) :: [ [String, String] ], maps frame field names to their display names
//   displayFields (optional) :: [ String ], the field names to be displayed
//   sortFields (optional) :: [ String ], field names to display sort buttons for
//   sortWith (required for sortFields) :: callback that receives sort comparison function
//   displayItemAs (optional) :: Component to render an frame as a table row
//      Defaults to DataTableRow.
//      Data container control props (.choose, etc.), if given, will be passed on
//      to this component.
// Other props will also be passed on to DataTable, including:
//   className, extras
//   headClassName, headExtras
//   bodyClassName, bodyExtras 
function FramesAsTable(props) {
    return (
        <DataTable {...props}
                   fieldMap={props.fieldMap || FRAME_FIELD_MAP}
                   displayFields={props.displayFields || FRAME_ALL_FIELDS} />
    );
}
 
// props:
//   queryParams :: { lexUnitId: ... }
var FramesContainer = dataContainerFor('Frames', selectFrames);
FramesContainer = connectWithApiQuery(FramesContainer, framesQueries.queryActions);

export { FramesContainer,
         FramesAsList,
         FramesAsTable }; 

