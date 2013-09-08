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
 * @fileoverview Public interface of the API for Cast. This is shared by the
 *     injected script and background page.
 */

/**
 * @const {string}
 */
cast.NAME = 'CastApi';


/**
 * @const {Array.<number>}
 */
cast.VERSION = [2, 4];


/**
 * @param {string} id The receiver ID.
 * @param {string} name The receiver name.
 * @constructor
 */
cast.Receiver = function(id, name) {
  /**
   * @type {string}
   * @expose
   */
  this.id = id;

  /**
   * @type {string}
   * @expose
   */
  this.name = name;

  /**
   * @type {?string}
   * @expose
   */
  this.ipAddress = null;

  /**
   * The tab projection status of the tab hosting this API instance.  This is
   * only set the first time the receiver is provided to the page using the API.
   * Its value is true if the tab is being casted to this
   * receiver, null otherwise.
   *
   * @type {?boolean}
   * @expose
   */
  this.isTabProjected = null;
};

/**
 * Extra details about an activity to be launched for use in the extension UI.
 *
 * @constructor
 */
cast.LaunchDescription = function() {
  /**
   * Textual description (i.e., video title)
   * @type {?string}
   * @expose
   */
  this.text = null;

  /**
   * URL to a GIF, JPEG, or PNG thumbnail image, with a maximum dimension of 64
   * pixels
   * @type {?string}
   * @expose
   */
  this.url = null;
};

/**
 * @param {string} activityType The activity type.
 * @param {cast.Receiver} receiver The receiver.
 * @constructor
 */
cast.LaunchRequest = function(activityType, receiver) {
  /**
   * @type {string}
   * @expose
   */
  this.activityType = activityType;

  /**
   * @type {cast.Receiver}
   */
  this['receiver'] = receiver; // Can't use @expose

  /**
   * Launch parameters to be passed with the receiver application as URL.  A
   * string is passed as-is, while an object is serialized using JSON.stringify.
   *
   * @type {?(Object|string)}
   * @expose
   */
  this.parameters = null;

  /**
   * @type {cast.LaunchDescription}
   * @expose
   */
  this.description = null;

  /**
   * One of 'stop' or 'continue'. With 'stop', receiver stops activity when the
   * connectivity from the sender to the receiver is interrupted, or the sender
   * goes away. With 'continue', receiver continues the activity, e.g.,
   * continues playing movie.
   * <p>
   * Tab mirroring always use 'stop'.
   * @type {string}
   * @expose
   */
  this.disconnectPolicy = 'continue';
};

/**
 * Describes the status of an activity after launching.
 *
 * @param {?string} activityId The activity ID.
 * @param {string} status The activity status.
 * @constructor
 */
cast.ActivityStatus = function(activityId, status) {
  /**
   * @type {?string}
   * @expose
   */
  this.activityId = activityId;

  /**
   * One of "running", "stopped", "error"
   * @type {string}
   * @expose
   */
  this.status = status;

  /**
   * A string describing the error when the status is "error".
   * @type {?string}
   * @expose
   */
  this.errorString = null;

  /**
   * An object describing extra status data exposed by the activity.
   *
   * @type {*}
   * @expose
   */
  this.extraData = {};
};

/**
 * Declares the public functions in the Cast API.
 *
 * @interface
 */
cast.IApi = function() {
};

/**
 * Adds listener function that is invoked when the list of receivers that
 * supports the activity type has changed.  Once added, the listener will be
 * invoked immediately with the current list.  DIAL application names are legal
 * activity types.
 *
 * @param {string} activityType The type of activity that the receiver should
 *          support.
 * @param {function(Array.<cast.Receiver>)} listener The listener.
 */
cast.IApi.prototype.addReceiverListener = function(activityType,
    listener) {};

/**
 * Removes a previously registered listener function for the receiver list.
 *
 * @param {string} activityType The type of activity.
 * @param {function(Array.<cast.Receiver>)} listener The listener.
 */
cast.IApi.prototype.removeReceiverListener = function(activityType,
    listener) {};

/**
 * Launches an activity according to the launchRequest and invokes a callback
 * with the status of the activity. If the activity could not be launched, the
 * status property of the result will be set to "error" and errorString will
 * contain an error message.
 *
 * @param {cast.LaunchRequest} launchRequest The launch request.
 * @param {function(cast.ActivityStatus)} resultCallback Callback
 *     invoked with the status of the launched activity.
 */
cast.IApi.prototype.launch = function(launchRequest, resultCallback) {};

/**
 * Returns the status of an activity. If the status could not be retrieved, the
 * status property of the result will be set to "error" and errorString will
 * contain an error message.
 *
 * @param {string} activityId The ID of the activity to check.
 * @param {function(cast.ActivityStatus)} resultCallback Callback invoked
 *     with the activity status.
 */
cast.IApi.prototype.getActivityStatus = function(activityId,
                                                 resultCallback) {};

/**
 * Stops an activity.  If the activity could be stopped, the status property of
 * the result will be set to "stopped". Otherwise, it will be set to "error" and
 * errorString will contain an error message.
 *
 * @param {string} activityId The ID of the activity to stop.
 * @param {function(cast.ActivityStatus)} resultCallback Callback invoked
 *     with the activity status.
 */
cast.IApi.prototype.stopActivity = function(activityId, resultCallback) {};


//////////////////////////////////////////////////////////////////////////////
// API specific to media player control via the Remote Access Media Protocol.
//////////////////////////////////////////////////////////////////////////////


/**
 * Describes the status of the media player.  Most fields are optional and are
 * only set if the activity supports them.
 *
 * @param {string} activityId The media player's activity id.
 * @param {number} state The player's state, one of idle (0), stopped (1),
 *   or playing (2).
 * @constructor
 */
cast.MediaPlayerStatus = function(activityId, state) {

  /**
   * @type {?number}
   * @expose
   */
  this.eventSequenceId = null;

  /**
   * @type {string}
   * @expose
   */
  this.activityId = activityId;

  /**
   * @type {number}
   * @expose
   */
  this.state = state;

  /**
   * Identifies the content currently playing.
   *
   * @type {?string}
   * @expose
   */
  this.contentId = null;

  /**
   * Title for the media.
   *
   * @type {?string}
   * @expose
   */
  this.title = null;

  /**
   * Image URL for the media.
   *
   * @type {?string}
   * @expose
   */
  this.imageUrl = null;

  /**
   * Whether the media is playing out (as opposed to buffering) and the playout
   * position should advance.
   *
   * @type {boolean}
   * @expose
   */
  this.timeProgress = false;

  /**
   * The player's position in the media item, in seconds since the beginning.
   *
   * @type {?number}
   * @expose
   */
  this.position = null;

  /**
   * The duration of the media item, in seconds.
   *
   * @type {?number}
   * @expose
   */
  this.duration = null;

  /**
   * The playout volume (0.0 - 1.0).
   *
   * @type {?number}
   * @expose
   */
  this.volume = null;

  /**
   * The muted status.
   *
   * @type {?boolean}
   * @expose
   */
  this.muted = null;

  /**
   * JSON object which give more in depth information about the content being
   * played.
   *
   * @type {Object}
   * @expose
   */
  this.contentInfo = null;

  /**
   * Array of media tracks that are available for the content.
   * @type {?Array.<cast.MediaTrack>}
   * @expose
   */
  this.mediaTracks = null;

  /**
   * The last error returned by the player.  The domain identifies the source of
   * the error and the code is domain-specific.
   *
   * @type {?{domain: string, code: number}}
   * @expose
   */
  this.error = null;

  /**
   * Whether player supports pauseMedia and playMedia commands.
   * @type {boolean}
   * @expose
   */
  this.hasPause = true;
};

/**
 * Holds the result of a media playback operation.
 *
 * @param {string} activityId  The media player's activity id.
 * @param {cast.MediaPlayerStatus=} opt_status  The status resulting from the
 *     operation (if any).
 * @constructor
 */
cast.MediaResult = function(activityId, opt_status) {
  /**
   * @type {string}
   * @expose
   */
  this.activityId = activityId;

  /**
   * @type {?cast.MediaPlayerStatus}
   * @expose
   */
  this.status = opt_status || null;

  /**
   * True if the operation was successful, false otherwise.
   * @type {boolean}
   * @expose
   */
  this.success = true;

  /**
   * A string describing the error when success == false.
   * @type {?string}
   * @expose
   */
  this.errorString = null;
};

/**
 * Request to set the playback volume.
 * <p>
 * At least one of volume or muted must be set.
 * @param {number=} opt_volume The new volume, 0.0 - 1.0.
 * @param {boolean=} opt_muted True to mute audio
 * @constructor
 */
cast.MediaVolumeRequest = function(opt_volume, opt_muted) {
  /**
   * @type {number | undefined}
   * @expose
   */
  this.volume = opt_volume;

  /**
   * @type {boolean | undefined}
   * @expose
   */
  this.muted = opt_muted;
};

/**
 * Request to load new media.
 *
 * @param {string} src Identifies the media item to play.
 * @constructor
 */
cast.MediaLoadRequest = function(src) {
  /**
   * @type {string}
   * @expose
   */
  this.src = src;

  /**
   * @type {?string} The title of the media item.
   * @expose
   */
  this.title = null;

  /**
   * @type {boolean} Whether to start playback immediately upon load.
   * @expose
   */
  this.autoplay = false;

  /**
   * JSON object which give more in depth information about the content being
   * loaded.
   *
   * @type {Object}
   * @expose
   */
  this.contentInfo = null;
};

/**
 * Request to start or resume playback.  Can be used to seek.
 *
 * @param {number=} opt_position The position to resume playback (in seconds
 *     after the beginning).
 * @constructor
 */
cast.MediaPlayRequest = function(opt_position) {
  /**
   * @type {?number}
   * @expose
   */
  this.position = opt_position || null;
};


/**
 * Represents a media track available in the content being played.  A track can
 * represent subtitles, closed captions, or distinct audio or video streams.
 * The receiver application will supply available tracks in a MediaPlayerStatus
 * object.

 * @param {number} id The track id.
 * @param {string} type The track type.
 * @constructor
 */
cast.MediaTrack = function(id, type) {

  /**
   * Identifier for the media track.  A positive integer.  Does not change
   * during the lifeteime of a playback session.
   *
   * @type {number}
   * @expose
   */
  this.id = id;

  /**
   * The type of the media track.  Possible types: "subtitles", "captions",
   * "audio", "video".
   *
   * @type {string}
   * @expose
   */
  this.type = type;

  /**
   * Human readable description for the track.  Optional.
   *
   * @type {?string}
   * @expose
   */
  this.name = null;

  /**
   * Language for the track, ISO-639 language code.  Optional.
   *
   * @type {?string}
   * @expose
   */
  this.language = null;

  /**
   * True if the track is in use.  Optional.
   *
   * @type {?boolean}
   * @expose
   */
  this.selected = null;
};


/**
 * Request to select the tracks that the media player should use.
 *
 * @constructor
 */
cast.MediaSelectTracksRequest = function() {

  /**
   * List of track IDs that will be enabled.
   *
   * @type {?Array.<number>}
   * @expose
   */
  this.enabledTracks = null;

  /**
   * List of track IDs that will be disabled.
   *
   * @type {?Array.<number>}
   * @expose
   */
  this.disabledTracks = null;
};

/**
 * Requests that media be loaded by the activity.
 *
 * @param {string} activityId The id of the activity.
 * @param {cast.MediaLoadRequest} loadRequest The request parameters.
 * @param {function(cast.MediaResult)} resultCallback Invoked with the result
 *     of the load request.
 */
cast.IApi.prototype.loadMedia =
    function(activityId, loadRequest, resultCallback) {};

/**
 * Requests that playback be started or resumed.
 *
 * @param {string} activityId The id of the activity.
 * @param {cast.MediaPlayRequest} playRequest The request parameters.
 * @param {function(cast.MediaResult)} resultCallback Invoked with the result
 *     of the play request.
 */
cast.IApi.prototype.playMedia =
    function(activityId, playRequest, resultCallback) {};

/**
 * Requests that playback be paused.
 *
 * @param {string} activityId The id of the activity.
 * @param {function(cast.MediaResult)} resultCallback Invoked with the result
 *     of the pause request.
 */
cast.IApi.prototype.pauseMedia = function(activityId, resultCallback) {};

/**
 * Requests that the volume be set on the media player.
 *
 * @param {string} activityId The id of the activity.
 * @param {cast.MediaVolumeRequest} volumeRequest The request parameters.
 * @param {function(cast.MediaResult)} resultCallback Invoked with the result
 *     of the set volume request.
 */
cast.IApi.prototype.setMediaVolume =
    function(activityId, volumeRequest, resultCallback) {};

/**
 * Sets the media tracks to enable and disable for the currently playing media.
 *
 * @param {string} activityId The id of the activity.
 * @param {cast.MediaSelectTracksRequest} tracksRequest The request parameters.
 * @param {function(cast.MediaResult)} resultCallback Invoked with the result
 *     of the select tracks request.
 */
cast.IApi.prototype.selectMediaTracks =
    function(activityId, tracksRequest, resultCallback) {};

/**
 * Requests the current status of the media player.
 *
 * @param {string} activityId The id of the activity.
 * @param {function(cast.MediaResult)} resultCallback Invoked with the result
 *     of the status request.
 */
cast.IApi.prototype.getMediaStatus = function(activityId, resultCallback) {};

/**
 * Adds a listener to be notified of changes to the media player status.
 *
 * @param {string} activityId The id of the activity whose status changed.
 * @param {function(cast.MediaPlayerStatus)} listener Invoked with the updated
 *     status.
 */
cast.IApi.prototype.addMediaStatusListener = function(activityId, listener) {};

/**
 * Removes a previously added listener.
 *
 * @param {string} activityId The id of the activity whose status changed.
 * @param {function(cast.MediaPlayerStatus)} listener Previously added
 *     listener.
 */
cast.IApi.prototype.removeMediaStatusListener =
    function(activityId, listener) {};

/**
 * @typedef {Object|string}
 */
cast.CustomMessage;

/**
 * Sends a message to an activity.  Only activities that support RAMP can
 * receive messages.  Delivery is not guaranteed, even if the this method
 * succeeds (i.e. if resultCallback is called with null).
 *
 * @param {!string} activityId The ID of the activity, as reported to the
 *     callback passed to the "launch" method.
 * @param {!string} namespace The namespace to associate with the message.
 * @param {cast.CustomMessage} message The message to send.
 * @param {?function(?string)} resultCallback Function called to report the
 *     result of sending the message.  The argument is null if the message
 *     was sent successfully, otherwise it is an error message.
 */
cast.IApi.prototype.sendMessage = function(
    activityId, namespace, message, resultCallback) {};

/**
 * Adds a listener function to be called when a message arrives from
 * an activity.
 * @param {string} activityId The ID of the activity to listen to.
 * @param {string} namespace The namespace to listen to.
 * @param {function(cast.CustomMessage)} listener Function called when a message
 *     arrives with the specified namespace.
 */
cast.IApi.prototype.addMessageListener = function(
    activityId, namespace, listener) {};

/**
 * Removes a listener previously registered with addMessageListener.
 * @param {string} activityId The ID of the activity to stop listening to.
 * @param {string} namespace The namespace parameter of the previously
 *     registered listener.
 * @param {function(cast.CustomMessage)} listener The previously registered
 *     listener function.
 */
cast.IApi.prototype.removeMessageListener = function(
    activityId, namespace, listener) {};
