export function effect(fn, options: any = {}) {
    const effect = createReactiveEffect(fn, options);

    if (!options.lazy) { // 默认的effect会立即执行一次
        effect();
    }
    return effect;
}


let uid = 0;
let activeEffect;
const effectStack = [];
function createReactiveEffect(fn, options) {
    const effect = function reactiveEffect() {
        if (!effectStack.includes(effect)) { // 保证这个effect没有加入到effectStack中
            try {
                effectStack.push(effect);
                activeEffect = effect;
                fn();
            } finally {
                effectStack.pop();
                activeEffect = effectStack[effectStack.length - 1];
            }
        }

    }
    effect.id = uid++; // 制作一个effect的唯一标识 用于区分effect
    effect._isEffect = true; // 用于标识这个是响应式effect 
    effect.row = fn; // 保留effect对应的原函数
    effect.options = options; // 在effect上保存用户的属性
    return effect;
}


const targetMap = new Map();
export function track(target, type, key) {
    if (activeEffect === undefined) { // 此属性不用收集依赖，因为没在effect中使用
        return;
    }

    let depsMap = targetMap.get(target); // 第一次为空
    if (!depsMap) {
        targetMap.set(target, (depsMap = new Map));
    }

    let dep = depsMap.get(key);

    if (!dep) {
        depsMap.set(key, (dep = new Set));
    }
    if (dep.has(activeEffect)) {
        dep.add(activeEffect);
    }
}

// effect(() => {
//     state.age++;
// })