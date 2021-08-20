// 判断当前传入值是不是对象
export const isObject = (value) => typeof value === 'object' && value !== null;

export const extend = Object.assign;