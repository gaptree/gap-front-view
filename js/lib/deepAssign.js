export const deepAssign = (res, ...srcs) => {
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
};
