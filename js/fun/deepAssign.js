export const deepAssign = (res, ...srcs) => {
    for (const src of srcs) {
        if (src instanceof Object) {
            for (const key in src) {
                if (!src.hasOwnProperty(key)) {
                    continue;
                }
                const item = src[key];
                if (item instanceof Object
                    && res.hasOwnProperty(key)) {
                    deepAssign(res[key], item);
                } else {
                    res[key] = item;
                }
            }
        }
    }
    return res;
};
