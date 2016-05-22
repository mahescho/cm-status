var ciphermail =
{
  bundle: null ,
  icon: "",
  strTooltip: "",
  strVerified: "",
  strSigner: "",
  strSigMail: "",
  strTrusted: "",
  strEncAlgo: "",
}

ciphermail.StreamListener =
{
  content: "" ,
  found: false ,
  onDataAvailable: function ( request , context , inputStream , offset , count )
  {
    try
    {
      var sis = Components.classes["@mozilla.org/scriptableinputstream;1"].createInstance ( Components.interfaces.nsIScriptableInputStream ) ;
      sis.init ( inputStream ) ;

      if ( ! this.found )
      {
        this.content += sis.read ( count ) ;
        this.content = this.content.replace ( /\r/g , "" ) ;
        var pos = this.content.indexOf ( "\n\n" ) ;

        if ( pos > -1 )
        {
          // last header line must end with LF -> pos+1 !!!
          this.content = this.content.substr ( 0 , pos + 1 ) ;
          this.found = true ;
        }
      }
    }
    catch ( ex ) { }
  } ,
  onStartRequest: function ( request , context )
  {
    this.content = "" ;
    this.found = false ;
  } ,
  onStopRequest: function ( aRequest , aContext , aStatusCode )
  {
    ciphermail.headers = Components.classes["@mozilla.org/messenger/mimeheaders;1"].createInstance ( Components.interfaces.nsIMimeHeaders ) ;
    ciphermail.headers.initialize ( this.content , this.content.length ) ;
    ciphermail.headerdata = this.content ;
    ciphermail.searchIcon ( ) ;
  }
}

ciphermail.loadHeaderData = function()
{
  var msgURI = null ;

  if ( gDBView )
  {
    msgURI = gDBView.URIForFirstSelectedMessage ;
  }

  if ( msgURI == null )
  {
    return ;
  }

  var messenger = Components.classes["@mozilla.org/messenger;1"].createInstance ( Components.interfaces.nsIMessenger ) ;
  var msgService = messenger.messageServiceFromURI ( msgURI ) ;
  msgService.CopyMessage ( msgURI , ciphermail.StreamListener , false , null , msgWindow , {} ) ;
}

ciphermail.getHeader = function ( key )
{
  var value = ciphermail.headers.extractHeader ( key , false ) ;

  if ( value == null )
  {
    value = "" ;
  }

  value = value.replace ( /\s+/g , " " ) ;
  return ( value ) ;
}

ciphermail.searchIcon = function ( )
{
  ciphermail.icon = "";
  ciphermail.strTooltip = "";
  ciphermail.strVerified = "";
  var apendix = "";

  ciphermail.strVerified  = ciphermail.getHeader ( "X-Djigzo-Info-Signer-Verified-0-0" ) ;
  apendix = "-0-0";
  if ( ciphermail.strVerified == "" )
  {
    ciphermail.strVerified  = ciphermail.getHeader ( "X-Djigzo-Info-Signer-Verified-1-0" ) ;
    apendix = "-1-0";
    if ( ciphermail.strVerified == "" )
    {
      ciphermail.strVerified  = ciphermail.getHeader ( "X-Djigzo-Info-Signer-Verified-0-1" ) ;
      apendix = "-0-1";
    }
  }

  ciphermail.strSigner  = ciphermail.getHeader ( "X-Djigzo-Info-Signer-ID"+apendix ) ;
  ciphermail.strSigMail = ciphermail.getHeader ( "X-Djigzo-Info-Signer-Email"+apendix ) ;
  ciphermail.strTrusted = ciphermail.getHeader ( "X-Djigzo-Info-Signer-Trusted"+apendix ) ;

  ciphermail.strEncAlgo   = ciphermail.getHeader ( "X-Djigzo-Info-Encryption-Algorithm-0" ) ;

  if ( ciphermail.strVerified != "" )
  {
    ciphermail.icon += "s";
    ciphermail.strTooltip = "signed";
  }
  if ( ciphermail.strEncAlgo != "" )
  {
    ciphermail.icon += "e";
    if ( ciphermail.strTooltip == "" )
    {
      ciphermail.strTooltip = "encrypted";
    }
    else
    {
      ciphermail.strTooltip += " / encrypted";
    }
  }
  if ( ciphermail.strTrusted != "" )
  {
    ciphermail.icon += "t";
    ciphermail.strTooltip += " / trusted";
  }

  if ( ciphermail.icon == "" )
  {
    ciphermail.icon = "x";
  }
  
  ciphermail.icon += ".png";

  // display ...

  var elem = document.getElementById ( "ciphermailbroadcast" ) ;

  if ( elem == null )
  {
    elem = document.getElementById ( "ciphermailicon" ) ;
  }

  elem.setAttribute ( "src" , "chrome://ciphermail/content/48x48/" + ciphermail.icon ) ;
  elem.setAttribute ( "tooltiptext" , ciphermail.strTooltip ) ;

  var mini = document.getElementById ( "ciphermailicon-mini" ) ;

  if ( mini )
  {
    mini.src = elem.src ;
    mini.setAttribute ( "tooltiptext" , ciphermail.strTooltip ) ;
  }
}


ciphermail.checktextPopup = function()
{
  var selectedText = ciphermail.checktextGetSelectedText() ;
  var elem = document.getElementById ( "dispmua-checktext" ) ;
  elem.hidden = true ;

  if ( selectedText != "" )
  {
    if ( selectedText.length > 18 )
    {
      selectedText = selectedText.substr ( 0 , 14 ) + "..." ;
    }

    var menuText = "ciphermail: \"" + selectedText + "\"" ;
    elem.setAttribute ( "label" , menuText ) ;
    elem.hidden = false ;
  }
}

ciphermail.checktextGetSelectedText = function()
{
  var node = document.popupNode ;
  var selection = "" ;

  if ( ( node instanceof HTMLTextAreaElement ) || ( node instanceof HTMLInputElement && node.type == "text" ) )
  {
    selection = node.value.substring ( node.selectionStart , node.selectionEnd ) ;
  }
  else
  {
    var focusedWindow = new XPCNativeWrapper ( document.commandDispatcher.focusedWindow , "document" , "getSelection()" ) ;
    selection = focusedWindow.getSelection().toString() ;
  }

  selection = selection.replace ( /(^\s+)|(\s+$)/g , "" ) ;
  return ( selection ) ;
}



ciphermail.infopopup = function()
{
  if ( ciphermail.strTooltip == "" )
  {
    alert ( "Not encrypted or signed !" ) ;
  }
  else
  {
    window.openDialog ( "chrome://ciphermail/content/details.xul", "CiphermailStatus", "chrome=yes,centerscreen",
    "chrome://ciphermail/content/48x48/" + ciphermail.icon, ciphermail.strTooltip, ciphermail.strVerified, ciphermail.strSigMail, ciphermail.strTrusted, ciphermail.strEncAlgo) ;
  }
}



ciphermail.init_overlay = function()
{
  if ( ciphermail.bundle != null )
  {
    return ;
  }

  ciphermail.bundle = document.getElementById ( "ciphermail-strings" ) ;

  var listener = {} ;
  listener.onStartHeaders = function(){} ;
  listener.onEndHeaders = ciphermail.loadHeaderData ;
  gMessageListeners.push ( listener ) ;

  var elem = document.getElementById ( "mailContext" ) ;

  if ( elem )
  {
    elem.addEventListener ( "popupshowing" , ciphermail.checktextPopup , false ) ;
  }
}

window.addEventListener ( "messagepane-loaded" , ciphermail.init_overlay , true ) ;


