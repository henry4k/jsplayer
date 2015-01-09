'use strict';

var jsplayer = (function() {
    /**
     * @constructor
     */
    function JSPlayer() {
        var element = document.createElement('div');
        element.className = 'jsplayer';

        this.element = element;

        this._createModalOverlay();
        this._showModalButton('PLAY', function() {
            console.log('Nope, not doing it.');
        });
    }

    JSPlayer.prototype = {
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
        }
    };

    return {
        JSPlayer: JSPlayer
    };
})();