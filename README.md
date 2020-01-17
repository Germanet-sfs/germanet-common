# Germanet-common

This is a library which provides a variety of abstractions for
implementing the following pattern:

  1. Fetching data objects from a backend API into the Redux store
     (see [APIWrapper](./components/APIWrapper))
  2. Selecting data objects from the store into a container (see [DataContainer](./components/DataContainer))
  3. Rendering the data in a container into a UI (see
     [GenericDisplay](./components/GenericDisplay) and [GenericForms](./components/GenericForms))

It also implements this pattern for the different types of data
objects in the [GermaNet](http://www.sfs.uni-tuebingen.de/GermaNet/) API, namely

  - synsets (see [Synsets](./components/Synset))
  - conceptual relations (see [ConRels](./components/ConRels))
  - lexical units (see [LexUnits](./components/LexUnits))
  - lexical relations (see [LexRels](./components/LexRels))
  - examples for lexical items (see [LexExamples](./components/LexExamples))
  - compounds (see [Compounds](./components/Compounds))
  - frames (see [Frames](./components/Frames))
  - Interlingual Index records (see [ILIRecords](./components/ILIRecords))
  - Wiktionary definitions (see [WiktionaryDefs](./components/WiktionaryDefs))

Thus, applications using this library can focus on just providing the
code needed to render GermaNet data for their own specific use case,
without having to define all the boilerplate for fetching that data
and managing it.

**Note**: if you are reading this README on NPM, the relative links on
this page will be broken. You can read the complete source and
documentation on
[GitHub](https://github.com/Germanet-sfs/germanet-common), or by
installing the package.

## Prerequisites

When you use these components from another project, that project
should have the following NPM packages installed:
  - axios
  - react
  - react-dom
  - redux
  - react-redux
  - seamless-immutable
  
These are listed as *peer dependencies* in the `package.json` file.
This means that this package relies on them, but does not bundle them
itself.  This is because consuming applications (for instance, any
project based on the SfS' `reactprojecttemplate` repository) are
likely to depend on these packages already.

## Code structure

The code is organized around the various functions in the general
pattern described above.  Each of these groupings consists of a React
component, or a set of related components, together with any functions
needed to manage their state via Redux.  Every grouping thus consists
of a directory under `components` with at least these files:

  - `README.md`: documentation specific to the component(s) 
  - `component.jsx`: the definition of the component(s)

If the component has local state managed by Redux, the following files
will also be present:

  - `actions.js`: Redux actions for the component(s)
  - `reducers.js`: Redux reducers for managing the component's state
  - `selectors.js`: Redux selectors which map the Redux state to the
    component's props
    
In some cases (notably `DataContainer` and `APIWrapper`), the
component is a higher-order component. In that case, the directory
structure follows the same pattern, but the associated actions,
reducers, and selectors are also higher order.  For example, in
APIWrapper's `actions.js`, instead of direct definitions of action
creators, there is a `makeQueryActions` function that *returns* action
creators.

In addition, there are several other files that contain code shared
across the library:
  - [errors.js](./): assorted error classes and
    handling functions
  - [helpers.js](./): assorted common utility
    functions


## Use

The library is available as a package on NPM in the `@sfstuebingen`
scope.  To install the package, run
```
npm install --save '@sfstuebingen/germanet-common'
```
in the directory containing your node_modules directory. (For internal
projects at the SfS, this is probably `webui`.) 

The library is shipped as ES2015 source code only; there is no bundle
of transpiled code.  Instead, consuming applications are expected to
transpile and bundle whatever code they need from the library.  There
are several advantages to this:

  - it makes importing the functions in the library straightforward
  - it makes debugging easier
  - it means you can bundle just the parts of the library that you
    need
  
The downside, however, is that if you are writing an application that
uses the library, you need to manage transpiling and bundling it
yourself.

### Installing Reducers

To make the library useful, you will need to install several reducers
from this library into your root Redux reducer.  You can import them
from the top-level `reducers.js`:
```
import { synsetSearches, dataContainers, apiData } from '@sfstuebingen/germanet-common/reducers';

const rootReducer = {
   ...
   synsetSearches,
   dataContainers,
   apiData,
   ...
}
```

In addition to handling their specified actions, these top-level
reducers respond to the global actions for the library (defined in the
top-level `actions.js`). They will, for example, clear all the state
that they manage when a `RESET_GERMANET_COMMON` action is emitted. The
reducers defined in individual component directories do *not* respond
to these global actions, so you should not import them directly unless
you want to override how these global actions are handled.

### Importing and using the components and other code

In general, you should just import the object you want using the full
path within this package to the file where it is defined:
```
import { lexUnitQueries } from '@sfstuebingen/germanet-common/components/LexUnits/actions';
```

As a shortcut, you can import a component from the library just using the path to the
directory containing its definition (leaving 'component' off at the end):
```
import { LexUnitsContainer, LexUnitsAsList } from '@sfstuebingen/germanet-common/components/LexUnits';
```

All components are also re-exported from
`@sfstuebingen/germanet-common/components`, so you can also leave off
the name of the component's directory:
```
import { LexUnitsContainer, LexUnitsAsList } from '@sfstuebingen/germanet-common/components';
```

### API path

By default, the library expects to make API calls to endpoints that
fall under `/api`, e.g., `/api/synsets`. You can customize this by
setting either `window.GERMANET_API_PREFIX` (recommended for new or
external projects) or `window.APP_CONTEXT_PATH` (for existing
applications at the SfS) to a prefix for these endpoints. Note that
you should do this before loading the library's code. For example, if
you set
```
window.GERMANET_API_PREFIX = '/germanet';
```
then API requests will go to endpoints like `/germanet/api/synsets`.
If you need more control over the exact path, you should edit the
`urlRoot` variable in the top-level constants.js module.
