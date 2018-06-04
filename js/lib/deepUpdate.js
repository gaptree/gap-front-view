export const deepUpdate = (res, src) => {
    if (!(res instanceof Object)) {
        return;
    }

    if (!(src instanceof Object)) {
        return;
    }

    //console.log(res, src);

    Object.keys(res).forEach(key => {
        if (!src[key]) {
            res[key] = undefined;
            return;
        }

        const srcItem = src[key];
        delete(src[key]);

        if (res[key] instanceof Array
            && srcItem instanceof Array
        ) {
            res[key] = srcItem;
            return;
        }

        if (res[key] instanceof Object
            && srcItem instanceof Object
        ) {
            deepUpdate(res[key], srcItem);
            return;
        }

        res[key] = srcItem;
    });

    Object.keys(src).forEach(key => {
        res[key] = src[key];
    });
    /*
    for (const src of srcs) {
        if (src instanceof Object) {
            for (const key in src) {
                if (!src.hasOwnProperty(key)) {
                    continue;
                }
                const item = src[key];
                if (!res[key]) {
                    res[key] = item;
                    continue;
                }

                if (item instanceof Object) {
                    if (res[key] instanceof Object) {
                        deepAssign(res[key], item);
                    } else {
                        throw new Error('format not match');
                    }
                } else {
                    res[key] = item;
                }
            }
        }
    }
    return res;
    */
};
