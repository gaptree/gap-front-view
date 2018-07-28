const tagName = 'gap-text';

export const textHolder = {
    tagName: tagName,
    hold: (inKey) => {
        const key = inKey.replace(/^"?|"?$/g, '');
        return `<${tagName} bind="${key}"></${tagName}>`;
    }
};
