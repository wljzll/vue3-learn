// 判断当前传入值是不是对象
export const isObject = (value) => typeof value === "object" && value !== null;

export const isString = (val: unknown): val is string =>
  typeof val === "string";

export const extend = Object.assign;

export const isArray = Array.isArray;

const hasOwnProperty = Object.prototype.hasOwnProperty;

export const hasOwn = (
  val: object,
  key: string | symbol
): key is keyof typeof val => hasOwnProperty.call(val, key);

export const hasChanged = (value: any, oldValue: any): boolean =>
  !Object.is(value, oldValue);

export const isIntegerKey = (key: unknown) =>
  isString(key) &&
  key !== "NaN" &&
  key[0] !== "-" &&
  "" + parseInt(key, 10) === key;

export const isFunction = (value) => typeof value === "function";

// 校验是否是事件
const onRE = /^on[^a-z]/;
export const isOn = (key: string) => onRE.test(key);
