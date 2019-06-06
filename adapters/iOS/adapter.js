cobalt.private.ios_adapter = {
  init: function() {
    cobalt.platform = {name: "iOS", isIOS: true, isAndroid: false};
  },
  send: function(obj) {
    if (obj && !cobalt.private.debugInBrowser) {
      cobalt.private.divLog('sending', obj);
      if (window.CobaltViewController && CobaltViewController.onCobaltMessage) {
        try {
          CobaltViewController.onCobaltMessage(JSON.stringify(obj));
        } catch (e) {
          cobalt.log('ERROR : cant stringify message to send to native', e);
        }
      } else {
        cobalt.private.divLog('ERROR : cant connect to native.');
      }
    }
  },
  //default behaviours
  navigateToModal: cobalt.private.defaultBehaviors.navigateToModal,
  storeModalInformations: cobalt.private.defaultBehaviors.storeModalInformations,
  dismissFromModal: cobalt.private.defaultBehaviors.dismissFromModal,
  initStorage: cobalt.private.defaultBehaviors.initStorage

};
