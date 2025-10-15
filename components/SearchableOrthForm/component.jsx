import React from 'react';
import { connect } from 'react-redux';
import { doSearch, updateSearchParams } from '../SynsetSearch/actions';

function SearchableOrthFormComponent(props) {
    // Destructure props, removing 'buttonExtras' as it's no longer needed
    const { orthForm, lexUnitIds, triggerSearch, updateSearchForm } = props;

    const handleSearchClick = (e) => {
        // Prevent the default link action (navigating to '#')
        e.preventDefault(); 
        
        const idsAsString = lexUnitIds.join(',');
        updateSearchForm(orthForm);
        triggerSearch(orthForm, false, idsAsString);
    };

    // If there are valid IDs, render a clickable `<a>` tag.
    // This gives us the standard blue, underlined link appearance.
    if (lexUnitIds && lexUnitIds.length > 0) {
        return (
            <a href="#" onClick={handleSearchClick}>
                {orthForm}
            </a>
        );
    }

    // Otherwise, render the plain text in a `<span>`.
    // Since both `<a>` and `<span>` are inline elements, they will align properly.
    return <span>{orthForm}</span>;
}

const mapDispatchToProps = dispatch => ({
    updateSearchForm: (word) => dispatch(updateSearchParams("wordSearchForm", { word: word })),
    triggerSearch: (word, ignoreCase, lexUnitIds) => dispatch(doSearch("wordSearchForm", word, ignoreCase, lexUnitIds)),
});

export const SearchableOrthForm = connect(null, mapDispatchToProps)(SearchableOrthFormComponent);