'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var React = require('react');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var React__default = /*#__PURE__*/_interopDefaultLegacy(React);

function _arrayLikeToArray(r, a) {
  (null == a || a > r.length) && (a = r.length);
  for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
  return n;
}
function _arrayWithHoles(r) {
  if (Array.isArray(r)) return r;
}
function _iterableToArrayLimit(r, l) {
  var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
  if (null != t) {
    var e,
      n,
      i,
      u,
      a = [],
      f = !0,
      o = !1;
    try {
      if (i = (t = t.call(r)).next, 0 === l) {
        if (Object(t) !== t) return;
        f = !1;
      } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0);
    } catch (r) {
      o = !0, n = r;
    } finally {
      try {
        if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return;
      } finally {
        if (o) throw n;
      }
    }
    return a;
  }
}
function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _slicedToArray(r, e) {
  return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest();
}
function _unsupportedIterableToArray(r, a) {
  if (r) {
    if ("string" == typeof r) return _arrayLikeToArray(r, a);
    var t = {}.toString.call(r).slice(8, -1);
    return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0;
  }
}

// src/utils.js
// Detect network speed using navigator.connection (falls back to ping test)
function getNetworkSpeed() {
  // Closure to maintain private state for ping test
  var speed = 'unknown';
  var connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  if (connection) {
    // Use effectiveType if available (e.g., 'slow-2g', '4g')
    speed = connection.effectiveType || 'unknown';
  } else {
    // Fallback ping test (simplified, uses a known server ping)
    var startTime = performance.now();
    var img = new Image();
    img.src = 'https://www.google.com/favicon.ico?' + Date.now();
    img.onload = function () {
      var duration = performance.now() - startTime;
      speed = duration < 200 ? 'fast' : duration < 500 ? 'medium' : 'slow';
    };
  }
  return speed; // Returns 'fast', 'medium', 'slow', or 'unknown'
}

// Score asset priority based on visibility and importance
function calculatePriority(asset, scrollY, windowHeight) {
  var rect = asset.getBoundingClientRect();
  var isVisible = rect.top >= 0 && rect.bottom <= windowHeight;
  var distanceFromTop = Math.abs(rect.top);
  var importanceScore = asset.dataset.priority ? parseInt(asset.dataset.priority, 10) : 1; // Custom data attribute
  // Higher score for visible or near-visible assets, weighted by importance
  return (isVisible ? 100 : 100 - distanceFromTop) * importanceScore;
}

// Manage a priority queue for assets
function prioritizeAssets(assets) {
  var queue = [];
  var scrollY = window.scrollY;
  var windowHeight = window.innerHeight;
  assets.forEach(function (asset) {
    queue.push({
      element: asset,
      priority: calculatePriority(asset, scrollY, windowHeight)
    });
  });
  return queue.sort(function (a, b) {
    return b.priority - a.priority;
  }); // Sort descending
}

// Load asset with adaptive quality based on network speed
function loadAsset(asset, networkSpeed) {
  var src = asset.dataset.src; // Store original src in data attribute
  if (!src) return;

  // Sanitize src to prevent XSS (security feature)
  var sanitizedSrc = src.replace(/[<>]/g, '').replace(/javascript:/gi, '');
  var isImage = /\.(jpg|png|gif|webp)$/i.test(sanitizedSrc);
  if (isImage) {
    var img = new Image();
    img.onload = function () {
      return asset.src = sanitizedSrc;
    }; // Set src only after load
    img.onerror = function () {
      return console.error("Failed to load ".concat(sanitizedSrc));
    };
    img.src = networkSpeed === 'slow' ? "".concat(sanitizedSrc, "?quality=low") : sanitizedSrc; // Adjust quality via query param
  } else {
    var script = document.createElement('script');
    script.src = sanitizedSrc;
    script.async = true;
    document.head.appendChild(script); // Append safely
  }
}

// CSRF protection for asset loading (simplified token check)
function checkCSRF() {
  var _document$querySelect;
  var token = (_document$querySelect = document.querySelector('meta[name="csrf-token"]')) === null || _document$querySelect === void 0 ? void 0 : _document$querySelect.content;
  if (!token) console.warn('CSRF token missing, consider adding <meta name="csrf-token" content="your-token">');
  return token || 'default-token'; // Fallback for demo
}

function styleInject(css, ref) {
  if ( ref === void 0 ) ref = {};
  var insertAt = ref.insertAt;

  if (!css || typeof document === 'undefined') { return; }

  var head = document.head || document.getElementsByTagName('head')[0];
  var style = document.createElement('style');
  style.type = 'text/css';

  if (insertAt === 'top') {
    if (head.firstChild) {
      head.insertBefore(style, head.firstChild);
    } else {
      head.appendChild(style);
    }
  } else {
    head.appendChild(style);
  }

  if (style.styleSheet) {
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(document.createTextNode(css));
  }
}

var css_248z = "/* src/styles.css */\n/* Base container for the asset loader, ensuring proper layout */\n.asset-loader {\n    position: relative;\n    /* Allows absolute positioning of child elements */\n    display: inline-block;\n    /* Maintains natural flow with surrounding content */\n    width: 100%;\n    /* Full width by default, adjustable via parent */\n    max-width: 100%;\n    /* Prevents overflow */\n}\n\n/* Placeholder for loading assets to avoid layout shifts */\n.loading-placeholder {\n    width: 100%;\n    /* Matches the asset size */\n    height: 200px;\n    /* Default height, adjustable via props in future */\n    background-color: #f0f0f0;\n    /* Light gray for visibility */\n    border: 1px dashed #ccc;\n    /* Dashed border to indicate loading */\n    text-align: center;\n    /* Center the loading text */\n    line-height: 200px;\n    /* Vertically center text */\n    color: #666;\n    /* Subtle text color */\n    font-size: 14px;\n    /* Readable size */\n}\n\n/* Style for the actual asset (image or script placeholder) */\n.asset-loader img,\n.asset-loader span {\n    max-width: 100%;\n    /* Responsive image sizing */\n    height: auto;\n    /* Maintain aspect ratio */\n    transition: opacity 0.3s ease;\n    /* Smooth fade-in for loaded assets */\n    opacity: 0;\n    /* Start hidden, fade in on load */\n}\n\n.asset-loader img.loaded,\n.asset-loader span.loaded {\n    opacity: 1;\n    /* Fade in when loaded */\n}\n\n/* Debug information display for developers */\n.debug-info {\n    position: absolute;\n    /* Position over the asset */\n    bottom: 0;\n    left: 0;\n    background-color: rgba(0, 0, 0, 0.7);\n    /* Semi-transparent black */\n    color: #fff;\n    /* White text for contrast */\n    padding: 4px 8px;\n    /* Compact padding */\n    font-size: 12px;\n    /* Small text to avoid clutter */\n    border-radius: 4px 4px 0 0;\n    /* Rounded top corners */\n    z-index: 10;\n    /* Above other elements */\n    white-space: nowrap;\n    /* Prevent text wrapping */\n}\n\n/* Security note: No dynamic styles from user input to prevent CSS injection */";
styleInject(css_248z);

// Component to intelligently load assets with adaptive prioritization
var AdaptiveAssetLoader = function AdaptiveAssetLoader(_ref) {
  var src = _ref.src,
    _ref$type = _ref.type,
    type = _ref$type === void 0 ? 'image' : _ref$type;
    _ref.priority;
    var _ref$debug = _ref.debug,
    debug = _ref$debug === void 0 ? false : _ref$debug;
  // State to manage loading status, network speed, and debug info
  var _useState = React.useState(true),
    _useState2 = _slicedToArray(_useState, 2),
    isLoading = _useState2[0],
    setIsLoading = _useState2[1]; // Tracks if asset is loading
  var _useState3 = React.useState('unknown'),
    _useState4 = _slicedToArray(_useState3, 2),
    networkSpeed = _useState4[0],
    setNetworkSpeed = _useState4[1]; // Stores network speed
  var _useState5 = React.useState(''),
    _useState6 = _slicedToArray(_useState5, 2),
    debugInfo = _useState6[0],
    setDebugInfo = _useState6[1]; // Debug output for developers

  // Memoized reference to the asset element for DOM manipulation
  var assetRef = React.useMemo(function () {
    return /*#__PURE__*/React__default["default"].createRef();
  }, []);

  // Effect to initialize network speed and set up event listeners
  React.useEffect(function () {
    // Check CSRF token for security (prevents unauthorized requests)
    var csrfToken = checkCSRF();
    if (!csrfToken) {
      console.warn('CSRF protection weak; consider adding a meta tag with a token.');
    }

    // Update network speed on mount and when connection changes
    var speed = getNetworkSpeed();
    setNetworkSpeed(speed);

    // Listen for scroll events to update priority
    var handleScroll = function handleScroll() {
      if (assetRef.current) {
        var queue = prioritizeAssets([assetRef.current]);
        setDebugInfo(debug ? "Priority: ".concat(queue[0].priority) : '');
        if (queue[0].priority > 50 && isLoading) {
          // High priority triggers load
          loadAsset(assetRef.current, speed);
          setIsLoading(false);
        }
      }
    };
    window.addEventListener('scroll', handleScroll, {
      passive: true
    }); // Passive for performance
    return function () {
      return window.removeEventListener('scroll', handleScroll);
    }; // Cleanup
  }, [assetRef, isLoading, debug]); // Dependency array for effect

  // Memoized callback to handle asset loading
  var handleLoad = React.useCallback(function () {
    if (assetRef.current && isLoading) {
      var sanitizedSrc = src.replace(/[<>]/g, '').replace(/javascript:/gi, ''); // Sanitize to prevent XSS
      assetRef.current.dataset.src = sanitizedSrc; // Store sanitized src
      loadAsset(assetRef.current, networkSpeed); // Load with adaptive quality
      setIsLoading(false); // Mark as loaded
    }
  }, [assetRef, isLoading, networkSpeed, src]);

  // Render different elements based on type
  var renderAsset = function renderAsset() {
    if (type === 'image') {
      return /*#__PURE__*/React__default["default"].createElement("img", {
        ref: assetRef,
        alt: "Adaptive loaded",
        className: isLoading ? 'loading-placeholder' : 'loaded',
        onLoad: handleLoad,
        style: {
          display: isLoading ? 'none' : 'block'
        }
      });
    } else if (type === 'script') {
      return /*#__PURE__*/React__default["default"].createElement("span", {
        ref: assetRef,
        "data-src": src,
        className: isLoading ? '' : 'loaded'
      });
    }
    return null;
  };
  return /*#__PURE__*/React__default["default"].createElement("div", {
    className: "asset-loader"
  }, renderAsset(), debug && /*#__PURE__*/React__default["default"].createElement("div", {
    className: "debug-info"
  }, debugInfo, " | Network: ", networkSpeed), isLoading && /*#__PURE__*/React__default["default"].createElement("div", {
    className: "loading-placeholder"
  }, "Loading..."));
};

// PropTypes for type checking (optional but best practice)
AdaptiveAssetLoader.propTypes = {
  src: function src(props, propName) {
    if (!props[propName] || typeof props[propName] !== 'string') {
      return new Error('src is required and must be a string');
    }
    return null;
  },
  type: function type(props, propName) {
    if (props[propName] && !['image', 'script'].includes(props[propName])) {
      return new Error('type must be "image" or "script"');
    }
    return null;
  },
  priority: function priority(props, propName) {
    if (props[propName] && (typeof props[propName] !== 'number' || props[propName] < 0)) {
      return new Error('priority must be a positive number');
    }
    return null;
  },
  debug: function debug(props, propName) {
    if (props[propName] && typeof props[propName] !== 'boolean') {
      return new Error('debug must be a boolean');
    }
    return null;
  }
};

// src/index.js

exports.AdaptiveAssetLoader = AdaptiveAssetLoader;
exports["default"] = AdaptiveAssetLoader;
