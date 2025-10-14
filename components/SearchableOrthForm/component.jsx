import { connect } from 'react-redux';
import { Button } from '../GenericForms/component';
import { doSearch, updateSearchParams } from '../SynsetSearch/actions';

import React from 'react';

function SearchableOrthFormComponent(props) {
    const { orthForm, lexUnitIds, buttonExtras, triggerSearch, updateSearchForm } = props;

    // If there are no IDs, we can't search, so just render the text.
    if (!lexUnitIds || lexUnitIds.length === 0) {
        return <span>{orthForm}</span>;
    }

    const handleSearchClick = () => {
        const idsAsString = lexUnitIds.join(',');
        // Dispatch actions to perform search and update the form text
        updateSearchForm(orthForm);
        triggerSearch(orthForm, false, idsAsString); // NOTE: doSearch signature updated
    };

    // Render as a clickable button-like element, using the passed-in styles
    return (
        <Button
            text={orthForm}
            onClick={handleSearchClick}
            extras={buttonExtras} // Use the prop here
        />
    );
}

const mapDispatchToProps = dispatch => ({
    updateSearchForm: (word) => dispatch(updateSearchParams("wordSearchForm", { word: word })),
    // Ensure doSearch in actions.js is updated for this signature
    triggerSearch: (word, ignoreCase, lexUnitIds) => dispatch(doSearch("wordSearchForm", word, ignoreCase, lexUnitIds)),
});

export const SearchableOrthForm = connect(null, mapDispatchToProps)(SearchableOrthFormComponent);