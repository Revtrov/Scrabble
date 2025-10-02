export const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0 // random integer 0–15
    const v = c === 'x' ? r : (r & 0x3) | 0x8 // version and variant bits
    return v.toString(16)
  })
}