import { isOn } from "@vue/shared";
import { patchAttrs } from "./modules/attrs";
import { patchClass } from "./modules/class";
import { patchEvent } from "./modules/event";
import { patchStyle } from "./modules/style";

/**
 * @description 对比更新目标元素的属性
 * @param el 目标元素
 * @param key 目标元素要比对的属性
 * @param prevValue 原来的值
 * @param nextValue 新值
 */
export const patchProp = function (el, key, prevValue, nextValue) {
  switch (key) {
    case "class": // 更新class
      patchClass(el, prevValue);
      break;
    case "style": // 更新style
      patchStyle(el, prevValue, nextValue);
      break;
    default:
      if (isOn(key)) {
        patchEvent(el, key, nextValue)
      } else {
        patchAttrs(el, key, nextValue);
      }
      break;
  }
};
