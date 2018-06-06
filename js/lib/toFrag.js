export const toFrag = (nodes) => {
    if (!nodes) {
        throw new Error('nodes cannot be empty');
    }

    const frag = document.createDocumentFragment();
    for (const node of nodes) {
        if (node instanceof Node) {
            frag.appendChild(node);
        }
    }
    return frag;
};
