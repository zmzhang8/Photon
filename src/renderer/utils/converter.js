export default class Converter {
  static secondsToString (seconds) {
    if (!seconds || seconds === Infinity) return ''
    if (typeof (seconds) === 'string') seconds = parseInt(seconds)
    if (seconds >= 86400) {
      return '> 1 day'
    } else {
      let hours = Math.floor(seconds / 3600)
      seconds %= 3600
      let minutes = Math.floor(seconds / 60)
      seconds %= 60
      seconds = Math.floor(seconds)
      return hours + ':' + (minutes < 10 ? '0' : '') + minutes + ':' + (seconds < 10 ? '0' : '') + seconds
    }
  }

  static bytesToString (bytes, precision = 0) {
    if (!bytes) bytes = 0
    if (typeof (bytes) === 'string') bytes = parseInt(bytes)
    bytes = Math.round(bytes)
    let base = Math.pow(10, parseInt(precision))
    if (bytes >= 1073741824) {
      return Math.round((bytes / 1073741824) * base) / base + 'G'
    } else if (bytes >= 1048576) {
      return Math.round((bytes / 1048576) * base) / base + 'M'
    } else if (bytes >= 1024) {
      return Math.round((bytes / 1024) * base) / base + 'K'
    } else {
      return Math.round(bytes) + ''
    }
  }

  static bytesToUnit (bytes) {
    if (!bytes) bytes = 0
    if (typeof (bytes) === 'string') bytes = parseInt(bytes)
    bytes = Math.round(bytes)
    if (bytes >= 1073741824) {
      return 'G'
    } else if (bytes >= 1048576) {
      return 'M'
    } else if (bytes >= 1024) {
      return 'K'
    } else {
      return ''
    }
  }

  static stringToBytes (str) {
    if (!str) str = '0'
    let bytes = parseFloat(str)
    if (str.endsWith('G')) {
      return Math.round(bytes * 1073741824)
    } else if (str.endsWith('M')) {
      return Math.round(bytes * 1048576)
    } else if (str.endsWith('K')) {
      return Math.round(bytes * 1024)
    } else {
      return Math.round(bytes)
    }
  }
}
