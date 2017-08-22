var isAndroid = /(android)/i.test(navigator.userAgent);
var isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
if (isIOS) {
  cobalt.adapter = cobalt.ios_adapter;
} else {
  cobalt.adapter = cobalt.android_adapter;
}
cobalt.debugInBrowser = true;
if (window.Android || window.CobaltViewController){
  cobalt.debugInBrowser = false;
}
