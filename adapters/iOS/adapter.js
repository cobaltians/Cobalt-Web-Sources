cobalt.private.ios_adapter = {
  isWKWebview: false,
  init: function() {
    cobalt.platform = {name: "iOS", isIOS: true, isAndroid: false};
    cobalt.private.adapter.detectWebviewIfNeeded();
  },
  detectWebviewIfNeeded: function(){
    if (!cobalt.private.adapter.platformDetected) {
      if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.cobalt
        && window.webkit.messageHandlers.cobalt.postMessage) {
        cobalt.private.divLog('We are on WKWebview');
        cobalt.private.adapter.isWKWebview = true;
      } else {
        if (typeof CobaltViewController === "undefined") {
          cobalt.private.divLog('Warning : CobaltViewController and webkit.messageHandlers.cobalt.postMessage undefined.');
        }
      }
      cobalt.private.adapter.platformDetected = true;
    }
  },
  send: function(obj) {
    if (obj && !cobalt.private.debugInBrowser) {
      cobalt.private.adapter.detectWebviewIfNeeded();
      cobalt.private.divLog('sending', obj);
      if (cobalt.private.adapter.isWKWebview) {
        try {
          window.webkit.messageHandlers.cobalt.postMessage(JSON.stringify(obj));
        } catch (e) {
          cobalt.private.divLog('ERROR : cant send to wkwebview.' + e)
        }

      } else {
        try {
          CobaltViewController.onCobaltMessage(JSON.stringify(obj));
        } catch (e) {
          cobalt.private.divLog('ERROR : cant send to webview.' + e)
        }
      }
    }
  },
  //default behaviours
  navigateToModal: cobalt.private.defaultBehaviors.navigateToModal,
  storeModalInformations: cobalt.private.defaultBehaviors.storeModalInformations,
  dismissFromModal: cobalt.private.defaultBehaviors.dismissFromModal,
  initStorage: cobalt.private.defaultBehaviors.initStorage

};
