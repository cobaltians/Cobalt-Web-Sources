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
  //datePicker stuff
  datePicker: {
    init: function(inputs) {
      cobalt.utils.each(inputs, function() {
        var input = this;
        var id = cobalt.utils.attr(input, 'id');

        var placeholder = cobalt.utils.attr(input, 'placeholder');
        if (placeholder) {
          cobalt.utils.append(document.head, '<style> #' + id + ':before{ content:"' + placeholder + '"; ' + cobalt.datePicker.placeholderStyles + ' } #' + id + ':focus:before,#' + id + '.not_empty:before{ content:none }</style>')
        }

        input.addEventListener('change', cobalt.datePicker.updateFromValue, false);
        input.addEventListener('keyup', cobalt.datePicker.updateFromValue, false);
      });
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
