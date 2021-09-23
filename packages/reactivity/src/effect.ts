import { isArray, isIntegerKey } from "@vue/shared";
import { TriggerOpTypes } from "./operators";
// effect的工作流程:




export function effect(fn, options: any = {}) {
  const effect = createReactiveEffect(fn, options);
  if (!options.lazy) {
    // 默认的effect会立即执行一次 只有立即执行一次才会有依赖的收集
    effect();
  }
  return effect;
}

let uid = 0; // effect的唯一标识
let activeEffect; // 当前正在执行的effect
const effectStack = []; // 存放effect的栈
/**
 * @description 创建effect函数
 * @param fn 用户调用effect时传入的函数
 * @param options 用户调用effect时传入的选项
 * @returns 真正的effect函数
 */
function createReactiveEffect(fn, options) {
  // 定义真正的effect函数
  const effect = function reactiveEffect() {
    if (!effectStack.includes(effect)) {
      // 保证这个effect没有加入到effectStack中
      try {
        effectStack.push(effect);
        activeEffect = effect;
        return fn();
      } finally {
        // 用户传入effect的fn()中的逻辑存在报错的可能 但我们无论如何都要弹出本次执行了的effect
        effectStack.pop();
        activeEffect = effectStack[effectStack.length - 1];
      }
    }
  };
  effect.id = uid++; // 制作一个effect的唯一标识 用于区分effect
  effect._isEffect = true; // 用于标识这个是响应式effect
  effect.row = fn; // 保留effect对应的原函数
  effect.options = options; // 在effect上保存用户的属性
  return effect;
}

const targetMap = new Map();
/**
 * @description 当用户在effect函数中取值时，收集当前的effect
 * @param target 目标对象
 * @param type 本次操作的类型
 * @param key 本次取值的键
 * @returns
 */
export function track(target, type, key) {
  if (activeEffect === undefined) {
    // 此属性不用收集依赖，因为没在effect中使用
    return;
  }

  let depsMap = targetMap.get(target); // 第一次为空
  if (!depsMap) {
    // 第一次收集时重新创建
    // 先将target当作键 一个新的map当作值
    targetMap.set(target, (depsMap = new Map()));
  }

  let dep = depsMap.get(key); // 获取对应的key的map结果

  if (!dep) {
    // 此前没有收集过
    depsMap.set(key, (dep = new Set())); // 将key作为键 给这个key设置一个Set结果作为值
  }
  if (!dep.has(activeEffect)) {
    // 如果Set中没有收集过这个effect
    dep.add(activeEffect); // 将key对应的effect依赖收集到对应key的Set中
  }

  console.log(targetMap);
}

// effect(() => {
//     state.age++;
// })

/**
 *
 * @param target 目标元素
 * @param type 本次对目标元素的操作类型 SET/ADD
 * @param key 本次对目标元素操作的KEY
 * @param newValue 新值
 * @param oldValue 老值
 * @returns
 */
export function trigger(target, type, key?, newValue?, oldValue?) {
  const depsMap = targetMap.get(target);
  if (!depsMap) {
    // 属性没有对应的effect
    return;
  }
  const effects = new Set(); // 设置集合
  const add = (effectsToAdd) => {
    if (effectsToAdd) {
      effectsToAdd.forEach((effect) => {
        effects.add(effect);
      });
    }
  };

  if (key === "length" && isArray(target)) {
    // 如果是数组并且修改的是length属性
    // ary.length = 10; 如果修改的是数组的length属性
    // 如果修改的是长度
    // 遍历数组对应的所有effect
    depsMap.forEach((dep, key) => {
      // key: 0,1......
      // 如果有长度的依赖要更新  如果依赖的key小于设置的长度也要更新
      if (key == "length" || key >= newValue) {
        // 收集要执行的effect
        add(dep);
      }
    });
  } else {
    // 数组或者Object但不是修改length属性
    if (key !== void 0) {
      // 修改key
      add(depsMap.get(key));
    }
    switch (type) {
      case TriggerOpTypes.ADD:
        if (isArray(target)) {
          if (isIntegerKey(key)) {
            // 给数组新增属性，直接触发length即可
            add(depsMap.get("length"));
          }
        }
        break;
      default:
        break;
    }
  }
  effects.forEach((effect: any) => {
    if (effect.options.scheduler) {
      return effect.options.scheduler(effect); // 如果有自己提供的scheduler，则执行scheduler逻辑
    }
    effect();
  });
}


// 待解决疑问点：数组的收集和更新问题
/**
 * 数组触发getter的情况：
 * 1) 取索引时触发getter，会将索引当作key收集依赖
 * 2) 取length时触发getter，会将length当作key收集依赖
 * 3) 取值整个数组，会触发一系列的属性的取值，造成依赖的收集
 *    Symbol(Symbol.toPrimitive)
 *    {"valueOf" => Set(1)}
 *    {"toString" => Set(1)}
 *    {"join" => Set(1)}
 *    {"length" => Set(1)}
 *    {"0" => Set(1)}
 *    {"1" => Set(1)}
 */
