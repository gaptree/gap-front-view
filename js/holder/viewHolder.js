const views = [];
let viewIndex = 0;

export const viewHolder = {
    tagName: 'gap-view',
    hold: (view) => {
        views[viewIndex] = view;
        return '"##' + viewIndex++ + '##"';
    },

    get: (input) => {
        if (!input) {
            throw new Error('cannot be empty');
        }

        const index = parseInt(input.replace(/^"?##|##"?$/g, ''));
        if (isNaN(index)) {
            throw new Error('viewHolder.require "##<num>##", but received ' + input);
        }
        if (!views[index]) {
            throw new Error('cannot find view with index of ' + index);
        }
        return views[index];
    }
};
