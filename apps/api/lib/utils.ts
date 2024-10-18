import { customAlphabet } from "nanoid"

export const generateUniqueId = () => {
  const nanoid = customAlphabet("1234567890abcdefghijklmnopqrstuvwxyz", 10)
  return nanoid()
}
