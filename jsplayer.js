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

    var pixelRatio = (function () {
        var context = document.createElement('canvas').getContext('2d');
        var devicePixelRatio = window.devicePixelRatio || 1;
        var backingStorePixelRatio = context.backingStorePixelRatio || 1;
        return devicePixelRatio / backingStorePixelRatio;
    })();

    /**
     * @param {HTMLCanvasElement} canvas
     */
    function updateCanvasSize( canvas ) {
        var rect = canvas.getBoundingClientRect();
        canvas.width  = rect.width  * pixelRatio;
        canvas.height = rect.height * pixelRatio;
    }

    /**
     * @param {Object} playable
     * @constructor
     */
    function JSPlayer( playable ) {
        if(!isPlayable(playable))
            throw new Error('Passed object is not playable.');
        this.playable = playable;

        var rootElement = document.createElement('div');
        rootElement.className = 'jsplayer';
        this.rootElement = rootElement;

        var canvas = document.createElement('canvas');
        rootElement.appendChild(canvas);
        this.canvas = canvas;

        this._update = this._update.bind(this);

        var toolbar = document.createElement('div');
        toolbar.className = 'toolbar';
        rootElement.appendChild(toolbar);
        this.toolbar = toolbar;

        toolbar.innerHTML = '<div>▶</div><div>▶</div>';

        this._createModalOverlay();
        this._showModalButton('▶', function() {
            updateCanvasSize(canvas);
            this.playable.load.call(this.playable, this);
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
        rootElement: null,

        /**
         * @type {HTMLCanvasElement}
         */
        canvas: null,

        /**
         * @type {HTMLElement}
         */
        modalOverlay: null,

        /**
         * @type {HTMLElement}
         */
        toolbar: null,

        /**
         * @private
         */
        _createModalOverlay: function() {

            var overlay = document.createElement('div');
            overlay.className = 'modaloverlay';
            this.rootElement.appendChild(overlay);
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
            window.requestAnimationFrame(this._update, this.canvas);
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
            window.requestAnimationFrame(this._update, this.canvas);

            var timeDelta = (timestamp - this.lastUpdate) / 1000.0;
            // Timestamps are doubles in milliseconds, but i want seconds.

            this.playable.update.call(this.playable, this, timeDelta);
            this.lastUpdate = timestamp;
        }
    };

    return {
        JSPlayer: JSPlayer
    };
})();