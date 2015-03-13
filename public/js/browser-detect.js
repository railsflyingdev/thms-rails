var BrowserDetect =
{
  init: function ()
  {
    this.browser = this.searchString(this.dataBrowser) || "Other";
    this.version = this.searchVersion(navigator.userAgent) ||       this.searchVersion(navigator.appVersion) || "Unknown";
  },

  searchString: function (data)
  {
    for (var i=0 ; i < data.length ; i++)
    {
      var dataString = data[i].string;
      this.versionSearchString = data[i].subString;

      if (dataString.indexOf(data[i].subString) != -1)
      {
        return data[i].identity;
      }
    }
  },

  searchVersion: function (dataString)
  {
    var index = dataString.indexOf(this.versionSearchString);
    if (index == -1) return;
    return parseFloat(dataString.substring(index+this.versionSearchString.length+1));
  },

  dataBrowser:
    [
      { string: navigator.userAgent, subString: "Chrome",  identity: "Chrome" },
      { string: navigator.userAgent, subString: "MSIE",    identity: "Explorer" },
      { string: navigator.userAgent, subString: "Firefox", identity: "Firefox" },
      { string: navigator.userAgent, subString: "Safari",  identity: "Safari" },
      { string: navigator.userAgent, subString: "Opera",   identity: "Opera" }
    ]

};

BrowserDetect.init();

if (BrowserDetect.browser == 'Explorer') {

  var ua = navigator.userAgent;
  var re  = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
  if (re.exec(ua) != null) rv = parseFloat( RegExp.$1 );

  if (rv <= 9) {
    $('html').addClass('ie');
  }

}

