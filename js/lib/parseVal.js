export const parseVal = (inVal) => {
    if (typeof inVal === 'function') {
        return inVal();
    }
    return inVal;
};
