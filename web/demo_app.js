/**
 * Copyright (C) 2013 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @constructor
 * @param {angular.Scope} $scope The scope.
 */
function DemoAppCtrl($scope) {

  /**
   * The Cast API object.
   *
   * @type {?cast.Api}
   */
  $scope.castApi = null;

  /**
   * @type {boolean}
   */
  $scope.castApiDetected = false;

  /**
   * @type {boolean}
   */
  $scope.showReceiverPicker = false;

  /**
   * @type {boolean}
   */
  $scope.showActivityControls = false;

  /**
   * The Cast application name to launch.
   *
   * @type {?string}
   */
  $scope.appName = null;

  /**
   * Parameters to pass with the cast.LaunchRequest.
   *
   * @type {?string}
   */
  $scope.launchParameters = null;

  /**
   * The set of available Cast receivers.
   *
   * @type {Array.<cast.Receiver>}
   */
  $scope.receiverList = [];

  /**
   * The id for the launched activity.
   *
   * @type {?string}
   */
  $scope.activityId = null;

  /**
   * The last status reported by the activity.
   *
   * @type {?string}
   */
  $scope.activityStatus = null;

  /**
   * The current media volume.
   *
   * @type {number}
   */
  $scope.mediaVolume = 0.5;

  /**
   * The last MediaPlayerStatus reported by the activity.
   *
   * @type {cast.MediaPlayerStatus}
   */
  $scope.mediaStatus = null;

  /**
   * Whether the activity supports pause.
   *
   * @type {boolean}
   */
  $scope.hasPause = false;

  /**
   * @type {?string}
   */
  $scope.errorMessage = null;

  /**
   * Handles a Cast "Hello" message from the window.
   *
   * @param {Event} event The event.
   */
  $scope.onWindowMessage = function(event) {
    if (event.source == window && event.data &&
        event.data.source && event.data.source == cast.NAME &&
        event.data.event && event.data.event == 'Hello') {
      $scope.initializeApi();
    }
  };

  $scope.initializeApi = function() {
    if (!$scope.castApi) {
      $scope.castApi = new cast.Api();
      $scope.castApi.logMessage('Cast API initialized.');

      $scope.castApiDetected = true;
      $scope.$watch('mediaVolume', function() {
        $scope.setMediaVolume();
      }).bind($scope);
      $scope.$apply();
    }
  };

  /**
   * Sets the application name that will be launched.
   */
  $scope.setApplication = function() {
    if ($scope.appName) {
      $scope.castApi.addReceiverListener($scope.appName,
                                         $scope.onReceiverUpdate);
      $scope.showReceiverPicker = true;
    } else {
      $scope.castApi.logMessage('Application name not set.');
    }
  };

  /**
   * Handles a receiver list update from the Cast API.
   * @param {Array.<cast.Receiver>} receivers The receiver list.
   */
  $scope.onReceiverUpdate = function(receivers) {
    $scope.castApi.logMessage('Got receiver list.');
    $scope.receiverList = receivers;
    $scope.$apply();
  };

  /**
   * Returns a callback to handle a activity status result.
   *
   * @param {string} originalAction The original action.
   * @return {function(cast.ActivityStatus)} A result callback.
   */
  $scope.getResultCallback = function(originalAction) {
    return function(status) {
      if (status.status == 'error') {
        $scope.errorMessage = status.errorString;
        $scope.$apply();
      } else {
        switch (originalAction) {
          case 'stopActivity':
          $scope.activityId = null;
          $scope.showActivityControls = false;
          // NOTE: We don't $apply on stop because the callback is invoked
          // immediately by the SDK while we are already in an $apply loop.
          break;
          case 'getActivityStatus':
          $scope.activityStatus = status.status;
          $scope.$apply();
          break;
          case 'launchActivity':
          $scope.activityId = status.activityId;
          $scope.activityStatus = status.status;
          $scope.showActivityControls = true;
          $scope.getMediaStatus();
          $scope.$apply();
          break;
        }
      }
    }
  };

  /**
   * Returns a callback to handle a media status result.
   *
   * @param {string} originalAction The original action.
   * @return {function(cast.MediaResult)} A result callback.
   */
  $scope.getMediaResultCallback = function(originalAction) {
    return function(result) {
      if (!result.success) {
        $scope.errorMessage = result.errorString;
      } else {
        switch (originalAction) {
          case 'playMedia':
          case 'pauseMedia':
          case 'muteMedia':
          case 'loadMedia':
          case 'unmuteMedia':
          case 'setMediaVolume':
          case 'getMediaStatus':
          $scope.mediaStatus = result.status;
          $scope.hasPause = result.status &&
              result.status.hasPause != undefined;
          break;
        }
      }
      $scope.$apply();
    }
  };

  /**
   * Handles a stop activity request.
   */
  $scope.stopActivity = function() {
    if (!$scope.activityId) {
      return;
    }
    $scope.castApi.stopActivity($scope.activityId,
                                $scope.getResultCallback('stopActivity'));
  };

  /**
   * Handles a play media request.
   */
  $scope.playMedia = function() {
    if (!$scope.activityId) {
      return;
    }
    $scope.castApi.playMedia(
        $scope.activityId,
        new cast.MediaPlayRequest(),
        $scope.getMediaResultCallback('playMedia'));
  };

  /**
   * Handles a pause media request.
   */
  $scope.pauseMedia = function() {
    if (!$scope.activityId) {
      return;
    }
    $scope.castApi.pauseMedia($scope.activityId,
                              $scope.getMediaResultCallback('pauseMedia'));
  };

  /**
   * Handles a mute media request.
   */
  $scope.muteMedia = function() {
    if (!$scope.activityId) {
      return;
    }
    $scope.castApi.setMediaVolume(
        $scope.activityId,
        new cast.MediaVolumeRequest($scope.mediaVolume, true),
        $scope.getMediaResultCallback('muteMedia'));
  };

  /**
   * Handles an unmute media request.
   * @private
   */
  $scope.unmuteMedia = function() {
    if (!$scope.activityId) {
      return;
    }
    $scope.castApi.setMediaVolume(
        $scope.activityId,
        new cast.MediaVolumeRequest($scope.mediaVolume, false),
        $scope.getMediaResultCallback('unmuteMedia'));
  };

  /**
   * Handles a set media volume request.
   */
  $scope.setMediaVolume = function() {
    if (!$scope.activityId) {
      return;
    }
    $scope.castApi.setMediaVolume(
        $scope.activityId,
        new cast.MediaVolumeRequest($scope.mediaVolume, false),
        $scope.getMediaResultCallback('setMediaVolume'));
  };

  /**
    * Handles a get media status request.
    */
  $scope.getMediaStatus = function() {
    if (!$scope.activityId) {
      return;
    }
    $scope.castApi.getMediaStatus(
        $scope.activityId,
        $scope.getMediaResultCallback('getMediaStatus'));
  };

  /**
   * Handles get-activity-status user requests.
   */
  $scope.getActivityStatus = function() {
    if (!$scope.activityId) {
      return;
    }
    $scope.castApi.getActivityStatus(
        $scope.activityId,
        $scope.getResultCallback('getActivityStatus'));
  };

  /**
   * Launch application on the selected receiver.
   * @param {cast.Receiver} receiver The receiver.
   */
  $scope.launchActivityAt = function(receiver) {
    if (!$scope.appName) {
      $scope.castApi.logMessage('Application name not set');
      return;
    }

    if ($scope.activityId) {
      $scope.stopActivity();
    }

    $scope.errorMessage = null;
    $scope.activityStatus = null;
    $scope.mediaStatus = null;

    var resultCallback = $scope.getResultCallback('launchActivity');

    var request = new cast.LaunchRequest($scope.appName, receiver);
    if ($scope.launchParameters) {
      request.parameters = $scope.launchParameters;
    }
    $scope.castApi.launch(request, resultCallback);
  };

  // Detect API and initialize when available.
  if (window.cast != undefined && cast.isAvailable) {
    $scope.initializeApi();
  } else {
    window.addEventListener('message', $scope.onWindowMessage, false);
  }
}
