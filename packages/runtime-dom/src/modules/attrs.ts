export const patchAttrs = (el, key, value) => {
  if(value == null) {
      (el as HTMLElement).removeAttribute(key)
  } else {
      (el as HTMLElement).setAttribute(key, value)
  }
}