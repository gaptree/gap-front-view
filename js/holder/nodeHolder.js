const nodes = [];
let nodeIndex = 0;

const assertNode = (node, msg = '') => {
    if (!(node instanceof Node)) {
        throw new Error(msg);
    }
};
const tagName = 'gap-node';

export const nodeHolder = {
    tagName: tagName,
    hold: (node) => {
        assertNode(node, 'nodeHolder.hold require Node');
        nodes[nodeIndex] = node;
        return `<${tagName} node-id="${nodeIndex++}"></${tagName}>`;
    },
    get: (input) => {
        const index = parseInt(input);
        if (isNaN(index)) {
            throw new Error('nodeHolder.get require number, but received ' + input);
        }

        if (!nodes[index]) {
            throw new Error('cannot find node with index of ' + index);
        }
        return nodes[index];
    }
};
