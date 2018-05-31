import {getFun} from './holder';
//import {bindElemProp} from './bindElemProp';

const parseDataProp = (inProp) => {
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment
    const [name, filterStr] = inProp.split('|');
    const filter = filterStr
        && filterStr.indexOf('$$') === 0
        && getFun(filterStr);
    return {name, filter};
};

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
        const dataProp = parseDataProp(node.getAttribute('bind'));
        data.descriptor(dataProp.name)
            .bindGapView(node, dataProp.filter);
    };

    const compileGapText = (node) => {
        const dataProp = parseDataProp(node.getAttribute('bind'));
        data.descriptor(dataProp.name)
            .bindGapText(node, dataProp.filter);
    };

    const compileElem = (elem) => {
        const toRemoves = [];

        for (const attr of elem.attributes) {
            const attrName = attr.name;
            const attrVal = attr.value;

            if (attrName === 'arr' || attrName === 'array') {
                const dataProp = parseDataProp(attrVal);
                data.descriptor(dataProp.name)
                    .bindArr(elem, dataProp.filter);
                continue;
            }

            if (attrName === 'ref') {
                getFun(attrVal)(elem);
                toRemoves.push(attrName);
                continue;
            }

            const sepIndex = attrName.indexOf('-');

            if (sepIndex <= 0) {
                continue;
            }

            const pre = attrName.substr(0, sepIndex);
            const type = attrName.substr(sepIndex + 1);

            if (pre === 'on') {
                elem.on(type, getFun(attrVal));
                toRemoves.push(attrName);
            } else if (pre === 'cb') {
                elem.cb(type, getFun(attrVal));
                toRemoves.push(attrName);
            } else if (pre === 'bind') {
                const dataProp = parseDataProp(attrVal);
                data.descriptor(dataProp.name)
                    .bindElemProp(elem, type, dataProp.filter);
                toRemoves.push(attrName);
            } else if (pre === 'trigger') {
                data.descriptor(type.replace(/-/gi, '.'))
                    .addTrigger(getFun(attrVal));
                toRemoves.push(attrName);
            }
        }

        toRemoves.forEach(attrName => elem.removeAttribute(attrName));
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
