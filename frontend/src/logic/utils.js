export const isPowerOfTwo = (n) => (n && (n & (n - 1)) === 0)
export const nextPowerOfTwo = (n) => 1 << (32 - Math.clz32(n - 1))


export function pairwise(arr) {
  const out = []
  for (let i = 0; i < arr.length; i += 2) out.push([arr[i], arr[i + 1] ?? null])
  return out
}

let __gid = 1
export function gid() { return __gid++ }
export function resetIds(start = 1) { __gid = start }
