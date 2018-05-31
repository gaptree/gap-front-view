import {getFun} from './holder';
//import {bindElemProp} from './bindElemProp';

export const compile = (data, tpl) => {

    const compileElem = (elem) => {
        if (!elem.attributes) {
            return;
        }

        if (elem._compiled) {
            return;
        }

        elem._compiled = true;

        const toRemoves = [];

        for (const attr of elem.attributes) {
            const attrName = attr.name;
            const attrVal = attr.value;

            if (attrName === 'ref') {
                getFun(attrVal)(elem);
                continue;
            }

            if (attrName === 'bind') {
                data.descriptor(attrVal).bindElem(elem);
                continue;
            }

            const sepIndex = attrName.indexOf('-');

            if (sepIndex <= 0) {
                continue;
            }

            const pre = attrName.substr(0, sepIndex);
            const type = attrName.substr(sepIndex + 1);

            if (pre === 'on') {
                elem.on(type, (e) => getFun(attrVal)(elem, e));
                toRemoves.push(attrName);
            } else if (pre === 'cb') {
                elem.cb(type, (e) => getFun(attrVal)(elem, e));
                toRemoves.push(attrName);
            } else if (pre === 'bind') {
                data.descriptor(attrVal)
                    .bindElemProp(elem, type);
                toRemoves.push(attrName);
            } else if (pre === 'trigger') {
                data.descriptor(type.replace(/-/gi, '.'))
                    .addTrigger((val) => getFun(attrVal)(elem, val));
                toRemoves.push(attrName);
            }
        }

        toRemoves.forEach(attr => elem.removeAttribute(attr));

        compileElemCollection(elem.children);
    };

    const compileElemCollection = (elemCollection) => {
        for (const elem of elemCollection) {
            compileElem(elem);
        }
    };

    for (const tplElem of tpl.elems) {
        compileElem(tplElem);
    }
};
