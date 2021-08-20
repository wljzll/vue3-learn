// 实现new Proxy()的get/set
// 是不是仅读的 是不是深度的

import { extend } from "@vue/shared";

/**
 *
 * @param isReadonly 是否只读 true仅读
 * @param shallow 是否浅层 true 浅的非深度
 */
function createGetter(isReadonly = false, shallow = false) {}
const get = createGetter();
const shallowGet = createGetter(false, true);
const readonlyGet = createGetter(true);
const shallowReadonlyGet = createGetter(true, true);

// 仅读(readonly)的公共set方法
let readonlyObj = {
    set: (target, key) => {
      console.warn(`set on key ${key} falied!`);
    },
  };



// 深度reactive
export const mutableHandlers = {
  get,
};

// 非深度reactive
export const shallowReactiveHandlers = {
  get: shallowGet,
};


// 深度readonly
export const readonlyHandlers = extend(
  {
    get: readonlyGet,
  },
  readonlyObj
);

// 非深度readonly
export const shallowReadonlyHandlers = extend(
  {
    get: shallowReadonlyGet,
  },
  readonlyObj
);
