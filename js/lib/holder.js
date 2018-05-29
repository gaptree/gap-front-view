const nodes = [];
const funs = [];

let nodeIndex = 0;
let funIndex = 0;

export const createNodeHolder = (node) => {
    nodes[nodeIndex] = node;
    return `<gap-node node-id="${nodeIndex++}"/>`;
};

export const getNode = (inputId) => {
    const id = parseInt(inputId);
    if (isNaN(id)) {
        throw new Error('Error tpl index format: ' + inputId);
    }
    return nodes[id];
};

export const createFunHolder = (fun) => {
    funs[funIndex] = fun;
    return '"$$' + funIndex++ + '$$"';
};

export const getFun = (index) => {
    const arrIndex = parseInt(index.replace(/^"?\$\$|\$\$"?$/g, ''));
    if (isNaN(arrIndex)) {
        throw new Error('Error index format: ' + index);
    }
    return funs[arrIndex];
};

export const createTextHolder = (key) => {
    return `<gap-text bind="${key}"></gap-text>`;
};
