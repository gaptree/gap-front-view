import {GapTpl} from './GapTpl';

export const gapTpl = (strs, ...items) => {
    return new GapTpl(strs, ...items);
};
