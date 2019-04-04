var isAndroid = /(android)/i.test(navigator.userAgent);
var isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
if (isIOS) {
  cobalt.adapter = cobalt.private.ios_adapter;
} else {
  cobalt.adapter = cobalt.private.android_adapter;
}
cobalt.private.debugInBrowser = true;
if (window.Android || window.CobaltViewController){
  cobalt.private.debugInBrowser = false;
}
