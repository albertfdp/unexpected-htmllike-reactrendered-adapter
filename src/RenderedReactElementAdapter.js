import GlobalHook from 'react-render-hook';
import React from 'react';
import ObjectAssign from 'object-assign';

const defaultOptions = {};

function isRawType(value) {
    var type = typeof value;
    return type === 'string' ||
        type === 'number' ||
        type === 'boolean' ||
        type === 'undefined' ||
        value === null;
}

function concatenateStringChildren(accum, value) {
    if (typeof value === 'string' && accum.length &&
        typeof accum[accum.length - 1] === 'string')
    {
        accum[accum.length - 1] = accum[accum.length - 1] + value;
        return accum;
    }
    accum.push(value);
    return accum;
}

class RenderedReactElementAdapter {

    constructor(options) {
        this._options = ObjectAssign({}, defaultOptions, options);
    }

    getName(comp) {
        return comp.data.name;
    }

    getAttributes(comp) {
        const props = {};
        if (comp.data.props) {
            Object.keys(comp.data.props).forEach(prop => {
                if (prop !== 'children' && prop !== 'ref' && prop !== 'key') {
                    props[prop] = comp.data.props[prop];
                }
            });
        }

        return props;
    }

    getChildren(comp) {
        let children = [];
        if (comp.data.children) {
            if (isRawType(comp.data.children)) {
                return this._options.convertToString ? [ '' + comp.data.children ] : [ comp.data.children ];
            }
            children = comp.data.children.map(child => {
                const renderedChild = GlobalHook.findInternalComponent(child);
                switch (renderedChild.data.nodeType) {
                    case 'NativeWrapper':
                        return GlobalHook.findInternalComponent(renderedChild.data.children[0]);
                    case 'Text':
                        return renderedChild.data.text;
                }

                return renderedChild;
            });

            if (this._options.concatTextContent) {
                children = children.reduce(concatenateStringChildren, [])
            }
        }
        return children;
    }

    setOptions(newOpts) {
        this._options = ObjectAssign(this._options, newOpts);
    }
}

RenderedReactElementAdapter.prototype.classAttributeName = 'className';

export default RenderedReactElementAdapter;