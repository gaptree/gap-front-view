import {Tpl} from './Tpl';

export const tpl = (strs, ...items) => {
    return new Tpl(strs, ...items);
};
