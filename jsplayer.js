'use strict';

var jsplayer = (function() {

    /**
     * @param {Object} playable
     * @return {Boolean}
     */
    function isPlayable( playable ) {
        return playable.load   instanceof Function &&
               playable.update instanceof Function;
    }

    /**
     * @param {Object} playable
     * @constructor
     */
    function JSPlayer( playable ) {
        if(!isPlayable(playable))
            throw new Error('Passed object is not playable.');
        this.playable = playable;

        var element = document.createElement('div');
        element.className = 'jsplayer';
        this.element = element;

        this._update = this._update.bind(this);

        this._createModalOverlay();
        this._showModalButton('PLAY', function() {
            this.playable.load.call(this.playable, this.element);
            this.startUpdateLoop();
        });
    }

    JSPlayer.prototype = {

        /**
         * @type {Object}
         */
        playable: null,

        /**
         * @type {DOMHighResTimeStamp}
         */
        lastUpdate: null,

        /**
         * Player root element.
         * @type {HTMLElement}
         */
        element: null,

        /**
         * @type {HTMLElement}
         */
        modalOverlay: null,

        /**
         * @private
         */
        _createModalOverlay: function() {

            var overlay = document.createElement('div');
            overlay.className = 'modaloverlay';
            this.element.appendChild(overlay);
            this.modalOverlay = overlay;

            this._showModalOverlay(false);
        },

        /**
         * @param {Boolean} show
         * @private
         */
        _showModalOverlay: function( show ) {

            if(show)
                this.modalOverlay.style.display = '';
            else
                this.modalOverlay.style.display = 'none';
        },

        /**
         * @param {HTMLElement} element
         * @private
         */
        _setModalOverlayContent: function( element ) {

            this.modalOverlay.innerHTML = '';
            this.modalOverlay.appendChild(element);
        },

        /**
         * @param {String} content
         * @param {Function} callback
         * @private
         */
        _showModalButton: function( content, callback ) {

            if(!callback instanceof Function)
                throw new Error('Callback must be a function.');

            var button = document.createElement('a');
            button.className = 'button';
            button.innerHTML = content;

            var player = this;

            button.addEventListener('click', function() {
                player._showModalOverlay(false);
                callback.call(player);
            });

            this._setModalOverlayContent(button);
            this._showModalOverlay(true);
        },

        startUpdateLoop: function() {
            window.requestAnimationFrame(this._update, this.element);
            this.lastUpdate = performance.now();
        },

        stopUpdateLoop: function() {
            window.cancelRequestAnimationFrame(this._update);
        },

        /**
         * @param {DOMHighResTimeStamp} timestamp
         * @private
         */
        _update: function( timestamp ) {
            window.requestAnimationFrame(this._update, this.element);

            var timeDelta = (timestamp - this.lastUpdate) / 1000.0;
            // Timestamps are doubles in milliseconds, but i want seconds.

            this.playable.update.call(this.playable, this.element, timeDelta);
            this.lastUpdate = timestamp;
        }
    };

    return {
        JSPlayer: JSPlayer
    };
})();