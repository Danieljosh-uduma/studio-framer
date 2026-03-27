/**
 * Virtual DOM Engine for Studio Framer
 */

import { StudioError, ERROR_CODES, validate } from "./errors.js";

export const h = (type, props, ...children) => {
    return {
        type,
        props: {
            ...props,
            children: children.flat().map(child =>
                typeof child === "object" ? child : createTextElement(child)
            ),
        },
    };
};

const createTextElement = (text) => {
    return {
        type: "TEXT_ELEMENT",
        props: {
            nodeValue: text,
            children: [],
        },
    };
};

const isEvent = (key) => key.startsWith("on");
const isProperty = (key) => key !== "children" && !isEvent(key);

export const mount = (vnode, container) => {
    if (!validate.isValidVNode(vnode)) {
        throw new StudioError(ERROR_CODES.VDOM_INVALID_TYPE, 'Invalid vnode structure');
    }

    if (!container) {
        throw new StudioError(ERROR_CODES.VDOM_MOUNT_FAILED, 'Container is required for mounting');
    }

    let dom;
    try {
        dom =
            vnode.type === "TEXT_ELEMENT"
                ? document.createTextNode("")
                : document.createElement(vnode.type);
    } catch (e) {
        throw new StudioError(
            ERROR_CODES.VDOM_INVALID_TYPE,
            `Failed to create element of type ${vnode.type}: ${e.message}`
        );
    }

    // Add event listeners
    Object.keys(vnode.props)
        .filter(isEvent)
        .forEach((name) => {
            const eventType = name.toLowerCase().substring(2);
            dom.addEventListener(eventType, vnode.props[name]);
        });

    // Set properties
    Object.keys(vnode.props)
        .filter(isProperty)
        .forEach((name) => {
            if (name === "class") {
                dom.className = vnode.props[name];
            } else {
                dom[name] = vnode.props[name];
            }
        });

    vnode.props.children.forEach((child) => mount(child, dom));

    vnode.dom = dom;
    container.appendChild(dom);
    return dom;
};

export const patch = (parent, oldVNode, newVNode) => {
    if (!oldVNode) {
        mount(newVNode, parent);
    } else if (!newVNode) {
        parent.removeChild(oldVNode.dom);
    } else if (oldVNode.type !== newVNode.type) {
        const newDom = mount(newVNode, parent);
        parent.replaceChild(newDom, oldVNode.dom);
    } else if (typeof newVNode.type === "string") {
        const dom = (newVNode.dom = oldVNode.dom);
        
        // Update props
        const oldProps = oldVNode.props || {};
        const newProps = newVNode.props || {};
        
        // Remove old props and events
        Object.keys(oldProps)
            .filter(key => key !== 'children')
            .forEach(name => {
                if (!(name in newProps)) {
                    if (isEvent(name)) {
                        const eventType = name.toLowerCase().substring(2);
                        dom.removeEventListener(eventType, oldProps[name]);
                    } else {
                        if (name === "class") {
                            dom.className = "";
                        } else {
                            dom[name] = "";
                        }
                    }
                }
            });

        // Set new/updated props and events
        Object.keys(newProps)
            .filter(key => key !== 'children')
            .forEach(name => {
                if (oldProps[name] !== newProps[name]) {
                    if (isEvent(name)) {
                        const eventType = name.toLowerCase().substring(2);
                        if (oldProps[name]) {
                            dom.removeEventListener(eventType, oldProps[name]);
                        }
                        dom.addEventListener(eventType, newProps[name]);
                    } else {
                        if (name === "class") {
                            dom.className = newProps[name];
                        } else {
                            dom[name] = newProps[name];
                        }
                    }
                }
            });

        // Patch children
        const oldChildren = oldVNode.props.children;
        const newChildren = newVNode.props.children;
        const max = Math.max(oldChildren.length, newChildren.length);
        for (let i = 0; i < max; i++) {
            patch(dom, oldChildren[i], newChildren[i]);
        }
    } else if (newVNode.type === "TEXT_ELEMENT") {
        if (oldVNode.props.nodeValue !== newVNode.props.nodeValue) {
            oldVNode.dom.nodeValue = newVNode.props.nodeValue;
        }
        newVNode.dom = oldVNode.dom;
    }
};

/**
 * Utility to convert HTML string to VNode
 * Note: Limited implementation for proof of concept
 */
export const htmlToVNode = (htmlString) => {
    if (typeof htmlString !== 'string') {
        throw new StudioError(
            ERROR_CODES.VDOM_HTML_PARSE_ERROR,
            'HTML must be a string'
        );
    }

    try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlString.trim(), "text/html");
        
        // Check for parse errors
        if (doc.body.innerHTML.includes('parsererror')) {
            throw new Error('HTML parse error detected');
        }

        if (!doc.body.firstChild) {
            throw new Error('HTML produced no elements');
        }

        return domToVNode(doc.body.firstChild);
    } catch (e) {
        throw new StudioError(
            ERROR_CODES.VDOM_HTML_PARSE_ERROR,
            `Failed to parse HTML: ${e.message}`,
            { htmlString: htmlString.substring(0, 100) }
        );
    }
};

const domToVNode = (dom) => {
    if (dom.nodeType === Node.TEXT_NODE) {
        return createTextElement(dom.nodeValue);
    }
    const props = {};
    Array.from(dom.attributes).forEach(attr => {
        props[attr.name] = attr.value;
    });
    const children = Array.from(dom.childNodes).map(domToVNode);
    return h(dom.tagName.toLowerCase(), props, ...children);
};
