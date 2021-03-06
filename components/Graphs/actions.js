import { makeQueryActions } from '../APIWrapper/actions';
import { APIError } from '../APIWrapper/validation';
import { apiPath } from '../../constants';

// data validator for graph objects, which should look like:
// {
//    nodes: [ { id: <nodeId> }, ...],
//    edges: [ { from: <nodeId>, to: <nodeId> }, ...],
// }
function isValidGraph(data) {
    if (!(data instanceof Object)) throw new APIError("Graph data was not an object");

    if (!(data.hasOwnProperty("nodes") && Array.isArray(data.nodes))) {
        throw new APIError("Graph data did not contain nodes array");
    }
    data.nodes.forEach(node => {
        if (!node.id) throw new APIError("Graph data node is missing .id");
    });

    if (!(data.hasOwnProperty("edges") && Array.isArray(data.edges))) {
        throw new APIError("Graph data did not contain edges array");
    }
    data.edges.forEach(edge => {
        if (!(edge.from && edge.to)) throw new APIError("Graph data edge is missing .from or .to");
    });

    // workaround for now: current backend sends HTTP 200 with an
    // empty graph object when path graph cannot be created, e.g.
    // because the two endpoint synsets in a path belong to different
    // word categories. The backend should send us a different status
    // code and an error message in this case, but until that is
    // implemented, this works instead:
    if (!data.nodes.length && !data.edges.length) {
        throw new APIError("Graph data not available");
    }

    var validatedData = data;
    if (!(data.hasOwnProperty("highlights") && Array.isArray(data.highlights))) {
        // ensure we have a highlights array even if the backend doesn't provide one.
        // TODO: really, this should be done in the backend code...
        validatedData.highlights = [];
    }

    return validatedData;
}


export const hnymPathQueries = makeQueryActions(
    'HNYM_PATH',
    apiPath.hnymPaths,
    params => ({ id: `from${params.fromSynsetId}to${params.toSynsetId}` }),
    isValidGraph
); 

