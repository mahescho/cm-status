function init()
{
  document.getElementById ( "details-icon" ).src = window.arguments[0] ;
  document.getElementById ( "details-icon" ).setAttribute ( "tooltiptext" , window.arguments[1] ) ;

  document.getElementById ( "details-verified"     ).setAttribute ( "value" , window.arguments[2] ) ;
  document.getElementById ( "details-sigmail"      ).setAttribute ( "value" , window.arguments[3] ) ;
  document.getElementById ( "details-trusted"      ).setAttribute ( "value" , window.arguments[4] ) ;
  if ( window.arguments[5] == "" )
  {
    document.getElementById ( "details-encryption"   ).setAttribute ( "value" , "none" ) ;
  }
  else
  {
    document.getElementById ( "details-encryption"   ).setAttribute ( "value" , window.arguments[5] ) ;
  }

  document.getElementById ( "details-button-close" ).focus() ;
}

function doKeypress ( ev )
{
  if ( ev.keyCode == KeyEvent.DOM_VK_ESCAPE )
  {
    doClose() ;
  }
  else if ( ev.keyCode == KeyEvent.DOM_VK_RETURN )
  {
    var focused = document.commandDispatcher.focusedElement ;

    if ( document.getElementById ( "details-button-close" ) == focused )
    {
      doClose() ;
    }

    if ( document.getElementById ( "details-button-send" ) == focused )
    {
      doSend() ;
    }
  }
}

function doSend()
{
    buildMail ( "0.1" ) ;
}

function buildMail ( version )
{
  var email = "ciphermail@mhcsoftware.de" ;
  var subject = "Ciphermail Addon Feedback - Version: " + version ;
  var body = "" ;
  openFeedbackMail ( email , subject , body ) ;
  doClose ( 1500 ) ;
}

function doClose ( time )
{
  if ( !time )
  {
    time = 10 ;
  }

  setTimeout ( "window.close();" , time ) ;
}

function openFeedbackMail ( email , subject , body )
{
  var msgComposeType = Components.interfaces.nsIMsgCompType ;
  var msgComposeFormat = Components.interfaces.nsIMsgCompFormat ;
  var msgComposer = Components.classes['@mozilla.org/messengercompose;1'].getService().QueryInterface ( Components.interfaces.nsIMsgComposeService ) ;
  var compParams = Components.classes['@mozilla.org/messengercompose/composeparams;1'].createInstance ( Components.interfaces.nsIMsgComposeParams ) ;

  if ( compParams )
  {
    compParams.type = msgComposeType.Template ;
    compParams.format = msgComposeFormat.PlainText ;
    var compFields = Components.classes['@mozilla.org/messengercompose/composefields;1'].createInstance ( Components.interfaces.nsIMsgCompFields ) ;

    if ( compFields )
    {
      compFields.to = email ;
      compFields.subject = subject ;
      compFields.body = body ;
      compParams.composeFields = compFields ;
      msgComposer.OpenComposeWindowWithParams ( null , compParams ) ;
    }
  }
}
