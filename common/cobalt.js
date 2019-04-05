/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2019 Cobaltians
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 * TODO proxy event cobalt:onPageShown to subsribe callback
 * TODO proxy event cobalt:onBackButtonPressed to subsribe callback
 * TODO proxy event cobalt:onPullToRefresh to subsribe callback
 * TODO proxy event cobalt:onInfiniteScroll to subsribe callback
 *
 * TODO only accept functions in subscribe and callbacks
 *
 * TODO remove debugInDiv
 * TODO debugInBrowser code for pubsub
 * TODO write in-code documentation for all public methods
 */
var cobalt = window.cobalt || {
  debug: true,

  // public methods
  init: function(options) {
    cobalt.private.utils.init();
    if (options) {
      this.debug = (options.debug !== false); // default to true;

      cobalt.private.debugInDiv = ( options.debugInDiv === true );

      if (cobalt.private.debugInDiv) {
        cobalt.private.createLogDiv();
      }
    }
    cobalt.storage.enable();
    if (cobalt.private.adapter) {
      cobalt.private.adapter.init();
    }
    cobalt.private.plugins.init();

    cobalt.private.send({'type': 'cobaltIsReady', version: cobalt.private.version})
  },
  log: function() {
    var logString = cobalt.private.argumentsToString(arguments);
    if (cobalt.debug) {
      if (cobalt.private.debugInBrowser && window.console) {
        console.log(logString);
      } else {
        cobalt.private.send({type: "log", value: logString})
      }
      cobalt.private.divLog(logString)
    }
  },
  publish: function(channel, message){
    if (!message) message = {};
    if (typeof channel !== "string") {
      cobalt.log('pubsub error : channel must be a string.')
      return false
    }
    if (typeof message !== "object" || Array.isArray(message)) {
      cobalt.log('pubsub error : message must be an object.')
      return false
    }
    cobalt.private.send({ type : "pubsub", action : "publish", channel : channel, message : message});
  },
  subscribe: function(channel, callback){
    if (typeof channel !== "string") {
      cobalt.log('pubsub error : channel must be a string.')
      return false
    }
    if (typeof callback !== "function") {
      cobalt.log('pubsub error : callback must be a function.')
      return false
    }
    cobalt.private.pubsub.handlers[channel] = callback;
    cobalt.private.send({ type : "pubsub", action : "subscribe", channel : channel });

  },
  unsubscribe: function(channel){
    if (typeof channel !== "string") {
      cobalt.log('pubsub error : channel must be a string.');
      return false
    }
    delete cobalt.private.pubsub.handlers[channel];
    cobalt.private.send({ type : "pubsub", action : "unsubscribe", channel : channel  });
  },
  navigate: {
    push: function(options) {
      if (options && (options.page || options.controller)) {
        cobalt.private.send({
          type: "navigation",
          action: "push",
          data: {
            page: options.page,
            controller: options.controller,
            animated: (options.animated !== false), //default to true
            data: options.data,
            bars: options.bars
          }
        });
        if (cobalt.private.debugInBrowser && window.event && window.event.altKey) {
          window.location = options.page || 'index.html';
        }
      }
    },
    pop: function(options) {
      cobalt.private.send({
        type: "navigation",
        action: "pop",
        data: {
          page: options && options.page,
          controller: options && options.controller,
          data: options && options.data
        }
      });
      if (cobalt.private.debugInBrowser && window.event && window.event.altKey) {
        window.close();
      }
    },
    replace: function(options) {
      if (options && (options.page || options.controller)) {
        cobalt.private.send({
          type: "navigation",
          action: "replace",
          data: {
            page: options.page,
            controller: options.controller,
            animated: (options.animated !== false), //default to true
            clearHistory: (options.clearHistory === true), //default to false
            data: options.data,
            bars: options.bars
          }
        });
        if (cobalt.private.debugInBrowser && window.event && window.event.altKey) {
          location.href = options.page;
        }
      }
    },
    modal: function(options) {
      if (options && (options.page || options.controller)) {
        cobalt.private.adapter.navigateToModal(options);

        if (cobalt.private.debugInBrowser && window.event && window.event.altKey) {
          setTimeout(function() {
            window.open(options.page, '_blank');
          }, 0);
        }
      }
    },
    dismiss: function(data) {
      cobalt.private.adapter.dismissFromModal(data);

      if (cobalt.private.debugInBrowser && window.event && window.event.altKey) {
        window.close();
      }
    }
  },
  nativeBars: {
    handler: undefined,
    setEventListener: function(handler) {
      cobalt.nativeBars.handler = handler;
    },
    handleEvent: function(data) {
      cobalt.log(data.action, data.name, data.data);
      if (data.name && cobalt.nativeBars.handler) {
        cobalt.nativeBars.handler(data.name, data.action, data.data);
      } else {
        cobalt.log('no handler defined. use setEventListener');
      }
    },
    send: function(data) {
      if (data) {
        cobalt.private.send({type: "ui", control: "bars", data: data});
      }
    },
    setBarsVisible: function(visible) {
      if (visible && (typeof visible.top !== "undefined" || typeof visible.bottom !== "undefined")) {
        cobalt.nativeBars.send({action: "setBarsVisible", visible: visible});
      } else {
        cobalt.log('setBarsVisible : nothing to set.')
      }
    },
    setBarContent: function(content) {
      if (content && (
          typeof content.backgroundColor !== "undefined"
          || typeof content.bottom !== "undefined"
          || typeof content.androidIcon !== "undefined"
          || typeof content.title !== "undefined"
        )) {
        cobalt.nativeBars.send({action: "setBarContent", content: content});
      } else {
        cobalt.log('setBarContent : nothing to set.')
      }
    },
    setActionContent: function(name, content) {
      if (name && content && (
          typeof content.androidIcon !== "undefined"
          || typeof content.iosIcon !== "undefined"
          || typeof content.icon !== "undefined"
          || typeof content.color !== "undefined"
          || typeof content.title !== "undefined"
        )) {
        cobalt.nativeBars.send({action: "setActionContent", name: name, content: content});
      } else {
        cobalt.log('setActionContent : nothing to set.')
      }
    },
    setActionParam: function(action, name, param, value) {
      if (param) {
        if (name) {
          var obj = {action: action, name: name};
          obj[param] = value;
          cobalt.nativeBars.send(obj);
        } else {
          cobalt.log(action, ': no action name provided.')
        }
      }
    },
    setActionVisible: function(name, visible) {
      this.setActionParam("setActionVisible", name, "visible", visible);
    },
    setActionEnabled: function(name, enabled) {
      this.setActionParam("setActionEnabled", name, "enabled", enabled);
    },
    setActionBadge: function(name, badge) {
      this.setActionParam("setActionBadge", name, "badge", '' + badge);
    },
    setBars: function(newBars) {
      if (cobalt.private.utils.isObject(newBars)) {
        cobalt.nativeBars.send({action: "setBars", bars: newBars});
      } else {
        cobalt.log('setBars: no bars provided.')
      }
    }
  },
  storage: {
    storage: false,
    enable: function() {
      var storage,
        fail,
        uid;
      try {
        uid = new Date().toString();
        (storage = window.localStorage).setItem(uid, uid);
        fail = storage.getItem(uid) !== uid;
        storage.removeItem(uid);
        fail && (storage = false);
      } catch (e) {
      }
      if (!storage) {
        return false;
      } else {
        this.storage = storage;
        return true;
      }
    },
    clear: function() {
      if (this.storage) {
        this.storage.clear();
      }
    },
    set: function(uid, value) {
      if (this.storage) {
        var obj = {
          t: typeof value,
          v: value
        };
        if (obj.v instanceof Date) {
          obj.t = "date";
        }
        return this.storage.setItem(uid, JSON.stringify(obj));
      }
    },
    get: function(uid) {
      if (this.storage) {
        var val = this.storage.getItem(uid, 'json');
        val = JSON.parse(val);
        if (val) {
          switch (val.t) {
            case "date":
              return new Date(val.v);
            default :
              return val.v;
          }
        }
      }
    },
    remove: function(uid) {
      if (this.storage) {
        return this.storage.removeItem(uid)
      }
    }
  },
  webLayer: {
    show: function(page, fadeDuration) {
      if (page) {
        cobalt.private.send({type: "webLayer", action: "show", data: {page: page, fadeDuration: fadeDuration}})
      }
    },
    dismiss: function(data) {
      cobalt.private.send({type: "webLayer", action: "dismiss", data: data});
    },
    bringToFront: function() {
      cobalt.private.send({type: "webLayer", action: "bringToFront"});
    },
    sendToBack: function() {
      cobalt.private.send({type: "webLayer", action: "sendToBack"});
    }
  },
  alert: function(options) {
    if (!options || (!options.message && !options.title)) {
      return cobalt.log('alert error : you must set at least message or title')
    }
    if (options.buttons && !Array.isArray(options.buttons)) {
      return cobalt.log('alert error : invalid buttons list')
    }

    var obj = {};
    cobalt.private.utils.extend(obj, {
      title: options.title,
      message: options.message,
      buttons: options.buttons || ['Ok'],
      cancelable:  (options.cancelable !== false), // default to true;
      alertId : (cobalt.private.alert.id++)
    });
    if (typeof options.callback === 'function') {
      cobalt.private.alert.handlers[obj.alertId] = options.callback;
    }
    cobalt.private.send({
      type: "ui", control: "alert", data: obj
    });

    if (cobalt.private.debugInBrowser) {
      var btns_str = "";
      cobalt.private.utils.each(obj.buttons, function(index, button) {
        btns_str += "\t" + index + " - " + button + "\n";
      });
      var index = parseInt(window.prompt(
        "Title : " + obj.title + "\n"
        + "Message : " + obj.message + "\n"
        + "Choices : \n" + btns_str, 0), 10);
      options.callback(isNaN(index) ? undefined : index);
    }

  },
  toast: function(text) {
    cobalt.private.send({type: "ui", control: "toast", data: {message: cobalt.private.utils.logToString(text)}});
  },
  openExternalUrl: function(url) {
    if (url) {
      cobalt.private.send({
        type: "intent",
        action: "openExternalUrl",
        data: {
          url: url
        }
      });
    }
  },
  pullToRefresh: {
    setTexts: function(pullToRefreshText, refreshingText) {
      if (typeof pullToRefreshText !== "string") pullToRefreshText = undefined;
      if (typeof refreshingText !== "string") pullToRefreshText = undefined
      cobalt.private.send({
        type: "ui",
        control: "pullToRefresh",
        data: {
          action: "setTexts",
          texts: {
            pullToRefresh: pullToRefreshText,
            refreshing: refreshingText
          }
        }
      });
    },
    dismiss: function(){
      cobalt.private.send({type: "ui",  control: "pullToRefresh", action: "dismiss"});
    }
  },
  infiniteScroll: {
    dismiss: function(){
      cobalt.private.send({type: "ui",  control: "infiniteScroll", action: "dismiss"});
    }
  },
  plugins: {
    //called by plugins.
    register: function(plugin) {
      return cobalt.private.plugins.register(plugin);
    }
  },
  private: {
    events: {},
    version: '1.0',
    debugInBrowser: false,
    debugInDiv: false,
    callbacks: {},
    lastCallbackId: 0,

    divLog: function() {
      if (cobalt.private.debugInDiv) {
        cobalt.private.createLogDiv();
        var logdiv = cobalt.private.utils.$('#cobalt_logdiv');
        if (logdiv) {
          var logString = "<br/>" + cobalt.private.argumentsToString(arguments);
          try {
            cobalt.private.utils.append(logdiv, logString);
          } catch (e) {
            cobalt.private.utils.append(logdiv, "<b>cobalt.log failed on something.</b>");
          }
        }
      }
    },
    argumentsToString: function() {
      var stringItems = [];
      //ensure arguments[0] exists?
      cobalt.private.utils.each(arguments[0], function(i, elem) {
        stringItems.push(cobalt.private.utils.logToString(elem))
      });
      return stringItems.join(' ');
    },
    createLogDiv: function() {
      if (!cobalt.private.utils.$('#cobalt_logdiv')) {
        //create usefull log div:
        cobalt.private.utils.append(document.body, '<div id="cobalt_logdiv" style="width:100%; text-align: left; height: 100px; border:1px solid blue; overflow: scroll; background:#eee;"></div>')
      }
    },
    send: function(obj) {
      if (!typeof obj === "object") return;
      if (window.Android || window.CobaltViewController) {
        cobalt.private.debugInBrowser = false;
      }
      if (cobalt.private.debugInBrowser) {
        cobalt.log('sending', obj);
      } else if (cobalt.private.adapter) {
        cobalt.private.adapter.send(obj);
      }
    },
    execute: function(json) {
      cobalt.private.divLog("received", json);
      /*parse data if string, die silently if parsing error */
      if (json && typeof json === "string") {
        try {
          json = JSON.parse(json);
        } catch (e) {
          cobalt.private.divLog("can't parse string to JSON");
        }
      }
      try {
        switch (json && json.type) {
          case "plugin":
            cobalt.private.plugins.handleEvent(json);
            break;
          case "event":
            cobalt.private.handleEvent(json);
            break;
          case "pubsub":
            cobalt.private.pubsub.handleMessage(json);
            break;
          case "ui":
            switch (json.control) {
              case "bars":
                cobalt.nativeBars.handleEvent(json.data);
                break;
              case "alert":
                cobalt.private.alert.handleResult(json.data);
                break;
            }
            break;
          case "navigation":
            switch (json.action) {
              case "modal":
                cobalt.private.adapter.storeModalInformations(json.data);
                break;
            }
            break;
          default:
            cobalt.private.handleUnknown(json)
        }
      } catch (e) {
        cobalt.log('cobalt.private.execute failed : ' + e)
      }
    },
    handleEvent: function(json) {
      cobalt.log("received event", json.event);
      if (cobalt.private.events && typeof cobalt.private.events[json.event] === "function") {
        cobalt.private.events[json.event](json.data, json.callback);
      } else {
        switch (json.event) {
          case "onBackButtonPressed":
            cobalt.navigate.pop();
            break;
          default :
            cobalt.private.adapter.handleUnknown(json);
            break;
        }
      }
    },
    alert: {
      id: 0,
      handlers:[],
      handleResult: function(data) {
        var handler = cobalt.private.alert.handlers[data.alertId];
        if (handler && typeof handler === 'function') {
          cobalt.private.alert.handlers[data.alertId](data.index);
        } else {
          cobalt.log('warning : received alert result index=' + data.index + ' but no handler found.')
        }
      }
    },
    pubsub: {
      handlers: {},
      handleMessage : function(json) {
        var handler = cobalt.private.pubsub.handlers[json.channel];
        if (handler && typeof handler === 'function') {
          cobalt.private.pubsub.handlers[json.channel](json.message);
        } else {
          cobalt.log('warning : received pubsub message on channel ' + json.channel + ' but no handler found.')
        }
      }
    },
    handleUnknown: function(json) {
      cobalt.log('received unhandled message ', json);
    },
    defaultBehaviors: {
      navigateToModal: function(options) {
        cobalt.private.send({
          "type": "navigation", "action": "modal", data: {
            page: options.page,
            controller: options.controller,
            data: options.data,
            bars: options.bars
          }
        });
      },
      dismissFromModal: function(data) {
        cobalt.private.send({"type": "navigation", "action": "dismiss", data: {data: data}});
      },
      initStorage: function() {
        return cobalt.storage.enable()
      },
      storeModalInformations: function() {}
    },
    utils: {
      $: function(selector) {
        if (typeof selector === "string") {
          if (selector[0] === "#") {
            return document.getElementById(selector.replace('#', ''));
          }
          else {
            return document.querySelectorAll(selector)
          }
        } else {
          return selector;
        }
      },
      toString: Object.prototype.toString,
      logToString: function(stuff) {
        switch (typeof  stuff) {
          case "string":
            break;
          case "function":
            stuff = ("" + stuff.call).replace('native', 'web'); //to avoid panic ;)
            break;
          default:
            try {
              stuff = JSON.stringify(stuff)
            } catch (e) {
              stuff = "" + stuff;
            }
        }
        return stuff;
      },
      class2type: {},
      attr: function(node, attr, value) {
        node = cobalt.private.utils.$(node);
        if (value) {
          if (node && node.setAttribute) {
            node.setAttribute(attr, value)
          }
        } else {
          return ( node && node.getAttribute ) ? node.getAttribute(attr) : undefined;
        }
      },
      text: function(node, text) {
        node = cobalt.private.utils.$(node);
        if (typeof node === "object") {
          if (text) {
            node.innerText = text;
          } else {
            return node.innerText
          }
        }
      },
      html: function(node, html) {
        node = cobalt.private.utils.$(node);
        if (typeof node === "object") {
          if (html !== undefined) {
            node.innerHTML = html;
          } else {
            return node.innerHTML;
          }
        }
      },
      HTMLEncode: function(value) {
        var element = document.createElement('div');
        cobalt.private.utils.text(element, value || '');
        return cobalt.private.utils.html(element);
      },
      HTMLDecode: function(value) {
        var element = document.createElement('div');
        cobalt.private.utils.html(element, value || '');
        return cobalt.private.utils.text(element);
      },
      likeArray: function(obj) {
        return typeof obj.length === 'number'
      },
      each: function(elements, callback) {
        var i, key;
        if (cobalt.private.utils.likeArray(elements)) {
          for (i = 0; i < elements.length; i++)
            if (callback.call(elements[i], i, elements[i]) === false) return
        } else {
          for (key in elements)
            if (callback.call(elements[key], key, elements[key]) === false) return
        }
      },
      extend: function(obj, source) {
        if (!obj) obj = {};
        if (source) {
          for (var prop in source) {
            obj[prop] = source[prop];
          }
        }
        return obj;
      },
      append: function(node, html) {
        node = cobalt.private.utils.$(node);
        if (typeof node === "object") {
          node.innerHTML = node.innerHTML + html;
        }
      },
      css: function(node, obj) {
        node = cobalt.private.utils.$(node);
        if (typeof node === "object" && node.style) {
          if (typeof obj === "object") {
            for (var prop in obj) {
              node.style[prop] = (typeof obj[prop] === "string") ? obj[prop] : obj[prop] + "px";
            }
          } else {
            var style = window.getComputedStyle(node);
            if (style) {
              return style[obj] ? style[obj].replace('px', '') : undefined;
            }
          }
        }
      },
      addClass: function(node, css_class) {
        node = cobalt.private.utils.$(node);
        if (typeof node === "object" && css_class) {
          if (node.classList) {
            node.classList.add(css_class);
          } else {
            node.setAttribute("class", node.getAttribute("class") + " " + css_class);
          }
        }
      },
      removeClass: function(node, css_class) {
        node = cobalt.private.utils.$(node);
        if (typeof node === "object" && css_class) {
          if (node.classList) {
            node.classList.remove(css_class);
          } else {
            node.setAttribute("class", node.getAttribute("class").replace(css_class, ''));
          }
        }
      },
      escape: encodeURIComponent,
      serialize: function(params, obj, traditional, scope) {
        var type, array = cobalt.private.utils.isArray(obj), hash = cobalt.private.utils.isPlainObject(obj);
        cobalt.private.utils.each(obj, function(key, value) {
          type = cobalt.private.utils.type(value);
          if (scope) key = traditional ? scope :
            scope + '[' + (hash || type === 'object' || type === 'array' ? key : '') + ']';
          // handle data in serializeArray() format
          if (!scope && array) params.add(value.name, value.value);
          // recurse into nested objects
          else if (type === "array" || (!traditional && type === "object"))
            cobalt.private.utils.serialize(params, value, traditional, key);
          else params.add(key, value)
        })
      },
      param: function(obj, traditional) {
        var params = [];
        params.add = function(k, v) {
          this.push(cobalt.private.utils.escape(k) + '=' + cobalt.private.utils.escape(v))
        };
        cobalt.private.utils.serialize(params, obj, traditional);
        return params.join('&').replace(/%20/g, '+')
      },
      isArray: function(obj) {
        if (!Array.isArray) {
          return Object.prototype.toString.call(obj) === '[object Array]';
        } else {
          return Array.isArray(obj);
        }
      },
      isNumber: function(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
      },
      isWindow: function(obj) {
        return obj !== null && obj === obj.window
      },
      isObject: function(obj) {
        return this.type(obj) === "object"
      },
      isPlainObject: function(obj) {
        return this.isObject(obj) && !this.isWindow(obj) && Object.getPrototypeOf(obj) === Object.prototype;
      },
      type: function(obj) {
        return obj === null ?
          String(obj) :
          this.class2type[cobalt.private.utils.toString.call(obj)] || "object";
      },
      init: function() {
        this.each("Boolean Number String Function Array Date RegExp Object Error".split(" "), function(i, name) {
          cobalt.private.utils.class2type["[object " + name + "]"] = name.toLowerCase()
        })
      }
    },
    plugins: {
      enabledPlugins: {},
      //add a plugin to the plugin list.
      register: function(plugin) {
        if (plugin && typeof plugin.name === "string" && typeof plugin.init === "function") {
          cobalt.private.plugins.enabledPlugins[plugin.name] = plugin;
        }
      },
      init: function() {
        for (var pluginName in cobalt.private.plugins.enabledPlugins) {
          if (cobalt.private.plugins.enabledPlugins[pluginName]) {
            //init each plugin with options set at the init step.
            cobalt.private.plugins.enabledPlugins[pluginName].init();
          }
        }
      },
      handleEvent: function(event) {
        //try to call plugin "handleEvent" function (if any).
        if (typeof event.name === "string") {
          if (cobalt.private.plugins.enabledPlugins[event.name]
            && typeof cobalt.private.plugins.enabledPlugins[event.name].handleEvent === "function") {

            try {
              cobalt.private.plugins.enabledPlugins[event.name].handleEvent(event);
            } catch (e) {
              cobalt.log('failed calling "' + event.name + '" plugin handleEvent function. ', e)
            }
          } else {
            cobalt.log('plugin "' + event.name + '" not found or no handleEvent function in this plugin.')
          }
        } else {
          cobalt.log('unknown plugin event', event)
        }

      }
    }
  }
};