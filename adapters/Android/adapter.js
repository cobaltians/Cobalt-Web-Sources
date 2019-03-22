cobalt.android_adapter = {
  //
  //ANDROID ADAPTER
  //
  init: function() {
    cobalt.platform = {name: "Android", isAndroid: true, isIOS: false};
  },
  //send native stuff
  send: function(obj) {
    if (obj && !cobalt.debugInBrowser) {
      cobalt.divLog('sending', obj);
      try {
        Android.onCobaltMessage(JSON.stringify(obj));
      } catch (e) {
        cobalt.log('ERROR : cant connect to native')
      }

    }
  },
  //modal stuffs. really basic on ios, more complex on android.
  navigateToModal: function(options) {
    cobalt.send({
      "type": "navigation",
      "action": "modal",
      data: {
        page: options.page,
        controller: options.controller,
        data: options.data,
        bars: options.bars
      }
    }, 'cobalt.adapter.storeModalInformations');
  },
  dismissFromModal: function(data) {
    var dismissInformations = cobalt.storage.get("dismissInformations");
    if (dismissInformations && dismissInformations.page && dismissInformations.controller) {
      cobalt.send({
        "type": "navigation",
        "action": "dismiss",
        data: {
          page: dismissInformations.page,
          controller: dismissInformations.controller,
          data: data
        }
      });
      cobalt.storage.remove("dismissInformations");
    } else {
      cobalt.log("WANRING : dismissInformations are not available in storage")
    }

  },
  storeModalInformations: function(params) {
    cobalt.divLog("storing informations for the dismiss :", params);
    cobalt.storage.set("dismissInformations", params);

  },
  //localStorage stuff
  initStorage: function() {
    //on android, try to bind window.localStorage to Android LocalStorage
    try {
      window.localStorage = LocalStorage;
    } catch (e) {
      cobalt.log("LocalStorage WARNING : can't find android class LocalStorage. switching to raw localStorage")
    }
    return cobalt.storage.enable();
  },
  //default behaviours
  handleEvent: cobalt.defaultBehaviors.handleEvent,
  handleCallback: cobalt.defaultBehaviors.handleCallback,
  handleUnknown: cobalt.defaultBehaviors.handleUnknown
};
