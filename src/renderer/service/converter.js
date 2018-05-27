export default class UnitConverter {
  static secondsToString (seconds) {
    if (!seconds) seconds = 0
    if (typeof (seconds) === 'string') seconds = parseInt(seconds)
    if (seconds === Infinity) {
      return ''
    } else if (seconds >= 86400) {
      return 'More than one day'
    } else {
      var str = ''
      str += Math.floor(seconds / 3600)
      seconds %= 3600
      str += ':' + Math.floor(seconds / 60)
      seconds %= 60
      str += ':' + Math.floor(seconds)
      return str
    }
  }

  static bytesToString (bytes) {
    if (!bytes) bytes = 0
    if (typeof (bytes) === 'string') bytes = parseInt(bytes)
    bytes = Math.round(bytes)
    if (bytes >= 1073741824) {
      return Math.round((bytes / 1073741824) * 100) / 100 + 'G'
    } else if (bytes >= 1048576) {
      return Math.round((bytes / 1048576) * 100) / 100 + 'M'
    } else if (bytes >= 1024) {
      return Math.round((bytes / 1024) * 100) / 100 + 'K'
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
