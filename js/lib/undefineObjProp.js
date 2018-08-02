export const undefineObjProp = (obj, prop)  => {
    if (obj[prop] instanceof Object) {
        Object.keys(obj[prop]).forEach(key => this.undefineObjProp(obj[prop], key));
        return;
    }
    obj[prop] = undefined;
};
