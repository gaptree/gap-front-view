export const toFrag = (nodes) => {
    const frag = document.createDocumentFragment();
    for (const node of nodes) {
        if (node instanceof Node) {
            frag.appendChild(node);
        }
    }
    return frag;
};
