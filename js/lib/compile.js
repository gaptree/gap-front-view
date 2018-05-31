import {getFun} from './holder';
//import {bindElemProp} from './bindElemProp';

export const compile = (data, tpl) => {

    const compileNode = (node) => {
        if (!node.attributes) {
            return;
        }

        if (node._compiled) {
            return;
        }

        node._compiled = true;

        if (node.tagName === 'GAP-VIEW') {
            compileGapView(node);
        } else if (node.tagName === 'GAP-TEXT') {
            compileGapText(node);
        } else {
            compileElem(node);
        }

        compileNodeCollection(node.children);
    };

    const compileGapView = (node) => {
        const bindProp = node.getAttribute('bind');
        data.descriptor(bindProp).bindGapView(node);
    };

    const compileGapText = (node) => {
        const bindProp = node.getAttribute('bind');
        data.descriptor(bindProp).bindGapText(node);
    };

    const compileElem = (elem) => {
        const toRemoves = [];

        for (const attr of elem.attributes) {
            const attrName = attr.name;
            const attrVal = attr.value;

            if (attrName === 'arr' || attrName === 'array') {
                data.descriptor(attrVal).bindArr(elem);
                continue;
            }

            if (attrName === 'ref') {
                getFun(attrVal)(elem);
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
    };

    const compileNodeCollection = (nodeCollection) => {
        for (const node of nodeCollection) {
            compileNode(node);
        }
    };

    for (const tplElem of tpl.elems) {
        compileNode(tplElem);
    }
};
