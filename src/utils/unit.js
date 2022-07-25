/* eslint-disable */
/**
 * Return the given bytes as a human friendly KB, MB, GB, or TB string
 * @param b_size: Bytes
 */
export const humanbytes = (b_size, fixed = 2, base = 1024) => {
  const size_kb = base  * 1.0
  const size_mb = (size_kb ** 2)  * 1.0       // 1,048,576
  const size_gb = (size_kb ** 3)  * 1.0       // 1,073,741,824
  const size_tb = (size_kb ** 4)  * 1.0       // 1,099,511,627,776
  try {
    if (b_size < size_kb) {
      return `${b_size} ${humanbytes > 1 ? 'Bytes' : 'Byte'}`;
    } else if (b_size >= size_kb && b_size < size_mb) {
      return `${(b_size / size_kb).toFixed(fixed)} KB`;
    } else if (b_size >= size_mb && b_size < size_gb) {
      return `${(b_size / size_mb).toFixed(fixed)} MB`;
    } else if (b_size >= size_gb && b_size < size_tb) {
      return `${(b_size / size_gb).toFixed(fixed)} GB`;
    } else {
      return `${(b_size / size_tb).toFixed(fixed)} TB`;
    }
  } catch (e) {
    return '0 Byte';
  }
};
export const humannumbers = (b_size, fixed = 2, base = 1000) => {
  const size_kb = base  * 1.0
  const size_mb = (size_kb ** 2)  * 1.0       // 1,048,576
  const size_gb = (size_kb ** 3)  * 1.0       // 1,073,741,824
  const size_tb = (size_kb ** 4)  * 1.0       // 1,099,511,627,776
  try {
    if (b_size < size_kb) {
      return `${b_size} `;
    } else if (b_size >= size_kb && b_size < size_mb) {
      return `${(b_size / size_kb).toFixed(fixed)} K`;
    } else if (b_size >= size_mb && b_size < size_gb) {
      return `${(b_size / size_mb).toFixed(fixed)} M`;
    } else if (b_size >= size_gb && b_size < size_tb) {
      return `${(b_size / size_gb).toFixed(fixed)} G`;
    } else {
      return `${(b_size / size_tb).toFixed(fixed)} T`;
    }
  } catch (e) {
    return '0';
  }
};
/* eslint-enable */
