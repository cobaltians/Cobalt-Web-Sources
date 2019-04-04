cobalt.ios_adapter = {
  //
  //IOS ADAPTER
  //
  init: function() {
    cobalt.platform = {name: "iOS", isIOS: true, isAndroid: false};
  },
  //send native stuff
  send: function(obj) {
    if (obj && !cobalt.debugInBrowser) {
      cobalt.divLog('sending', obj);
      if (window.CobaltViewController && CobaltViewController.onCobaltMessage) {
        try {
          CobaltViewController.onCobaltMessage(JSON.stringify(obj));
        } catch (e) {
          cobalt.log('ERROR : cant stringify message to send to native', e);
        }
      } else {
        cobalt.divLog('ERROR : cant connect to native.');
      }
    }
  },
  //default behaviours
  handleCallback: cobalt.defaultBehaviors.handleCallback,
  handleEvent: cobalt.defaultBehaviors.handleEvent,
  handleUnknown: cobalt.defaultBehaviors.handleUnknown,
  navigateToModal: cobalt.defaultBehaviors.navigateToModal,
  dismissFromModal: cobalt.defaultBehaviors.dismissFromModal,
  initStorage: cobalt.defaultBehaviors.initStorage

};
