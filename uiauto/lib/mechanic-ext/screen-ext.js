/* globals $, errors */

(function() {
  $.extend($, {

    // Screen-related functions
    getScreenOrientation: function () {
      var orientation = $.orientation()
        , value = null;
      switch (orientation) {
        case UIA_DEVICE_ORIENTATION_UNKNOWN ||
             UIA_DEVICE_ORIENTATION_FACEUP ||
             UIA_DEVICE_ORIENTATION_FACEDOWN:
          value = "UNKNOWN";
          break;
        case UIA_DEVICE_ORIENTATION_PORTRAIT ||
             UIA_DEVICE_ORIENTATION_PORTRAIT_UPSIDEDOWN:
          value = "PORTRAIT";
          break;
        case UIA_DEVICE_ORIENTATION_LANDSCAPELEFT ||
             UIA_DEVICE_ORIENTATION_LANDSCAPERIGHT:
          value = "LANDSCAPE";
          break;
      }
      if (value !== null) {
        return {
          status: errors.Success.code,
          value: value
        };
      } else {
        return {
          status: errors.UnknownError.code,
          value: 'Unsupported Orientation: ' + orientation
        };
      }
    }

  , setScreenOrientation: function (orientation) {
      if (orientation === "LANDSCAPE") {
        $.orientation(UIA_DEVICE_ORIENTATION_LANDSCAPELEFT);
      } else if (orientation === "PORTRAIT") {
        $.orientation(UIA_DEVICE_ORIENTATION_PORTRAIT);
      } else {
        return {
          status: errors.UnknownError.code,
          value: 'Unsupported orientation: ' + orientation
        };
      }
      var newOrientation;
      var success = false;
      var i = 0;
      while (!success && i < 20) {
        newOrientation = this.getScreenOrientation().value;
        success = newOrientation === orientation;
        $.system().performTaskWithPathArgumentsTimeout("/bin/sleep", ['0.1'], 1);
        i++;
      }
      if (success) {
        return {
          status: errors.Success.code
        , value: newOrientation
        };
      } else {
        return {
          status: errors.UnknownError.code
        , value: "Orientation change did not take effect: expected " +
            orientation + " but got " + newOrientation
        };
      }
    }

  , getWindowSize: function () {
      var size = $.target().rect().size;
      return {
        status: errors.Success.code
      , value: size
      };
    }

  , getWindowIndicators: function (win) {
      var activityIndicators = win.activityIndicators();
      var pageIndicators = win.pageIndicators();
      var progressIndicators = win.progressIndicators();

      var indicators = activityIndicators.toArray().concat(
        pageIndicators.toArray(), progressIndicators.toArray());

      // remove bad indicators
      for (var i = indicators.length - 1; i >= 0; i--) {
        if (indicators[i].type() === "UIAElementNil") {
          indicators.splice(i, 1);
        }
        if (indicators[i].isValid() === false) {
          indicators.splice(i, 1);
        }
      }
      return indicators;
    }
    
  });
})();
