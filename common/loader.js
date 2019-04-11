var isAndroid = /(android)/i.test(navigator.userAgent);
var isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
if (isIOS) {
  cobalt.private.adapter = cobalt.private.ios_adapter;
} else {
  cobalt.private.adapter = cobalt.private.android_adapter;
}
cobalt.private.debugInBrowser = true;
if (window.Android || window.CobaltViewController
  || (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.cobalt && window.webkit.messageHandlers.cobalt.postMessage)
){
  cobalt.private.debugInBrowser = false;
}
