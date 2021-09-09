/**
 *
 * @param el dom元素
 * @param value 最新的class
 */
export const patchClass = (el, value) => {
  if (value == null) { // 如果传入的新的value值为null 就是要清除class
    value = "";
  }
  el.className = value; // 直接用新的class覆盖即可
};
