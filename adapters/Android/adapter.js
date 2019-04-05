cobalt.private.android_adapter = {
  init: function() {
    cobalt.platform = {name: "Android", isAndroid: true, isIOS: false};
  },
  send: function(obj) {
    if (obj && !cobalt.private.debugInBrowser) {
      cobalt.private.divLog('sending', obj);
      try {
        Android.onCobaltMessage(JSON.stringify(obj));
      } catch (e) {
        cobalt.log('ERROR : cant connect to native')
      }

    }
  },
  navigateToModal: function(options) {
    cobalt.private.send({
      "type": "navigation",
      "action": "modal",
      data: {
        page: options.page,
        controller: options.controller,
        data: options.data,
        bars: options.bars
      }
    });
  },

  dismissFromModal: function(data) {
    var dismissInformations = cobalt.storage.get("dismissInformations");
    if (dismissInformations) {
      cobalt.private.send({
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
    cobalt.private.divLog("storing informations for the dismiss :", params);
    cobalt.storage.set("dismissInformations", params);

  },
  initStorage: function() {
    //on android, try to bind window.localStorage to Android LocalStorage Cobalt Class.
    try {
      // noinspection JSAnnotator
      window.localStorage = LocalStorage;
    } catch (e) {
      cobalt.log("LocalStorage WARNING : can't find android class LocalStorage. switching to raw localStorage")
    }
    return cobalt.storage.enable();
  }
};
