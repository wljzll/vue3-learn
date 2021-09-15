export const nodeOps = {
  // 增加元素
  insert: (child, parent, anchor) => {
    parent.insertBefore(child, anchor || null);
  },
  // 移除元素
  remove: (child) => {
    const parent = child.parentNode;
    if (parent) {
      parent.removeChild(child);
    }
  },
  // 创建元素
  createElement: (tag) => document.createElement(tag),
  // 创建文本
  createText: (text) => document.createTextNode(text),
  // 给元素节点设置文本内容
  setElementText: (el, text) => {
    (el as HTMLElement).textContent = text;
  },
  // 给文本节点设置文本内容
  setText: (node, text) => {
    node.nodeValue = text;
  },
  // 获取父节点
  parent: (node) => node.parentNode,
  // 获取下一个兄弟节点
  nextSibling: (node) => node.nextSibling,
  querySelector: (selector) => document.querySelector(selector),
};
