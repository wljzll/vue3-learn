export const patchEvent = (el, rawName, nextValue) => {
  const invokers = el._evi || (el._evi = {}); // 保存el上定义的事件
  const exisitingInvoker = invokers[rawName];
  if (nextValue && exisitingInvoker) {
    // 如果已绑定过这个事件 并且传入的新的处理函数存在
    exisitingInvoker.value = nextValue; // 更新事件处理函数上的value属性
  } else {
    // 处理函数不存在 或者 未绑定过这个事件
    const name = rawName.slice(2).toLowerCase(); // 截取出事件名称
    if (nextValue) {
      // 处理函数存在说明没绑定过这个事件 新绑定事件
      // 生成事件的处理函数
      const invoker = (invokers[name] = createInvoker(nextValue));
      el.addEventListener(name, invoker)
    } else if (exisitingInvoker) {
      // 已经绑定过 但是nextValue不存在 说明是解绑事件
      el.removeEventListener(name); // 移除事件
      invokers[name] = undefined; // 清空缓存
    }
  }
};
/**
 * @description 将原始处理函数赋值给invoker这个函数的value属性 并在这个函数里执行 invoker.value()这个原始处理函数
 * @param initialValue 事件对应的处理函数
 * @returns 事件处理函数
 */
function createInvoker(initialValue) {
  // 事件触发被触发 执行invoker 然后执行其中的 initialValue这个函数
  const invoker = (e) => {
    invoker.value(e);
  };
  invoker.value = initialValue; // 将事件对应的处理函数添加到 invoker函数的value属性上
  return invoker;
}
