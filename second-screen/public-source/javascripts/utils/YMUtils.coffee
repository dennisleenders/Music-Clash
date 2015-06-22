window.ym = window.ym or {}

window.ym.utils = 
  getBrowser: ->
    versionSearchString = ""
    searchString = (data) ->
      i = 0

      while i < data.length
        dataString = data[i].string
        dataProp = data[i].prop
        versionSearchString = data[i].versionSearch or data[i].identity
        if dataString
          return data[i].identity  unless dataString.indexOf(data[i].subString) is -1
        else return data[i].identity  if dataProp
        i++
      return

    searchVersion = (dataString) ->
      index = dataString.indexOf(versionSearchString)
      return  if index is -1
      parseFloat dataString.substring(index + versionSearchString.length + 1)
      
    dataOS = [
      {
        string: navigator.platform
        subString: "Win"
        identity: "Windows"
      }
      {
        string: navigator.platform
        subString: "Mac"
        identity: "Mac"
      }
      {
        string: navigator.userAgent
        subString: "iPhone"
        identity: "iPhone"
      }
      {
        string: navigator.userAgent
        subString: "iPad"
        identity: "iPad"
      }
      {
        string: navigator.userAgent
        subString: "Android"
        identity: "Android"
      }
      {
        string: navigator.platform
        subString: "Linux"
        identity: "Linux"
      }
    ]
    dataBrowser = [
      {
        string: navigator.userAgent
        subString: "Chrome"
        identity: "Chrome"
      }
      {
        string: navigator.userAgent
        subString: "OmniWeb"
        versionSearch: "OmniWeb/"
        identity: "OmniWeb"
      }
      {
        string: navigator.vendor
        subString: "Apple"
        identity: "Safari"
        versionSearch: "Version"
      }
      {
        prop: window.opera
        identity: "Opera"
        versionSearch: "Version"
      }
      {
        string: navigator.vendor
        subString: "iCab"
        identity: "iCab"
      }
      {
        string: navigator.vendor
        subString: "KDE"
        identity: "Konqueror"
      }
      {
        string: navigator.userAgent
        subString: "Firefox"
        identity: "Firefox"
      }
      {
        string: navigator.vendor
        subString: "Camino"
        identity: "Camino"
      }
      {
        string: navigator.userAgent
        subString: "Netscape"
        identity: "Netscape"
      }
      {
        string: navigator.userAgent
        subString: "MSIE"
        identity: "Explorer"
        versionSearch: "MSIE"
      }
      {
        string: navigator.userAgent
        subString: "Gecko"
        identity: "Mozilla"
        versionSearch: "rv"
      }
      {
        string: navigator.userAgent
        subString: "Mozilla"
        identity: "Netscape"
        versionSearch: "Mozilla"
      }
    ]
    browser = searchString(dataBrowser) or "browser-unknown"
    version = searchVersion(navigator.userAgent) or searchVersion(navigator.appVersion) or "x"
    OS = searchString(dataOS) or "os-unknown"
    browserInfo =
      browser: browser
      version: version
      OS: OS

    browserInfo

  identifyBrowser: ->
    if !ym.utils.browserInfo
      browserInfo = ym.utils.browserInfo = ym.utils.getBrowser()
      document.getElementsByTagName("html")[0].className = document.getElementsByTagName("html")[0].className + " #{browserInfo.browser.toLowerCase()} #{browserInfo.OS.toLowerCase()} #{browserInfo.browser.toLowerCase()}-#{browserInfo.version}"

  random: (min, max) ->
    return min + Math.random() * (max - min)