import { isOn } from "@vue/shared";
import { patchAttrs } from "./modules/attrs";
import { patchClass } from "./modules/class";
import { patchStyle } from "./modules/style";

export const patchProps = function (el, key, newValue, nextValue) {
  switch (key) {
    case "class": // 更新class
      patchClass(el, newValue);
      break;
    case "style": // 更新style
      patchStyle(el, newValue, nextValue);
    default:
      if (isOn(key)) {
      } else {
        patchAttrs(el, key, nextValue);
      }
      break;
  }
};
