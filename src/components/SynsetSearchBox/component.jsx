// SynsetSearchBox/component.jsx
// Definition of SynsetSearchBox component

import { doSearch, updateSearchTerm, updateIgnoreCase } from './actions';
import { searchBoxState, selectSynsetsForSearchBox } from './selectors';
import { dataContainerFor } from '../DataContainer/component';

import React from 'react';
import { connect } from 'react-redux';

class SynsetSearchBox extends React.Component {
    constructor(props){
        super(props);
        
        this.handleOnSearchTermChange = this.handleOnSearchTermChange.bind(this);
        this.handleToggleCheckIgnoreCase = this.handleToggleCheckIgnoreCase.bind(this); 
        this.onSubmit = this.onSubmit.bind(this);
    }

    handleOnSearchTermChange (e) {
        this.props.updateSearchTerm(e.target.value);
    }

    handleToggleCheckIgnoreCase () {
        this.props.updateIgnoreCase();
    }

    onSubmit (e) {
        e.preventDefault();
        this.props.doSearch(this.props.currentSearchTerm, this.props.ignoreCase);
    }

    render() {
        return ( 
            <div className="d-none d-md-block">
                <div className="card" style={{
                    margin: "auto",
                    float: "none",
                    marginBottom: "10px",
                    marginTop: "10px"
                }}>
                   <div className="card-body">
                       <form className="form-inline" onSubmit={this.onSubmit}>
                           { this.props.error && <p className="search-term-form__error">{this.props.error}</p> }
                            <div className="form-group mx-sm-3 mb-10">
                                <input
                                    className="form-control"
                                    type="text"
                                    placeholder={this.props.mostRecentSearchTerm || "Enter a Word or Id"}
                                    value={this.props.currentSearchTerm}
                                    onChange={this.handleOnSearchTermChange}
                                    autoFocus={true}
                               />
                            </div>
                            <div className="btn-group mr-2" role="group">
                                <button type="button" className="btn btn-primary" onClick={this.onSubmit}>Find</button>
                            </div>
                            <div className="form-check mx-sm-3 mb-10">
                              <input type="checkbox"
                                     className="form-check-input"
                                     checked={this.props.ignoreCase}
                                     onChange={this.handleToggleCheckIgnoreCase} />
                                <label className="form-check-label" htmlFor="ignoreCase">ignore case</label>                                                                        
                            </div>
                       </form>
                   </div>
                </div>
            </div>                           
        )
    }
}

function mapStateToProps (state, ownProps) {
    return searchBoxState(ownProps.id, state);
}

function mapDispatchToProps (dispatch, ownProps) {
    return {
        doSearch: (term, igcase) => dispatch(doSearch(ownProps.id, term, igcase)),
        updateSearchTerm: (term) => dispatch(updateSearchTerm(ownProps.id, term)),
        updateIgnoreCase: () => dispatch(updateIgnoreCase(ownProps.id)),
    };
}

SynsetSearchBox = connect(mapStateToProps, mapDispatchToProps)(SynsetSearchBox);
export { SynsetSearchBox };

// props:
//   source :: String, the .id of the corresponding SynsetSearchBox
const SynsetSearchResults = dataContainerFor('SynsetSearchResults', selectSynsetsForSearchBox);

export { SynsetSearchResults };
