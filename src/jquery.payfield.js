/**
 * Project: Payfield
 * Description: Single Input Credit Card Processing
 * Author: @toddlawton
 * Date: 05/07/2015
 */
;(function ( $, window, document, undefined ) {

	"use strict";

		var pluginName = "payfield",
			defaults = {
				creditCardTests: {
					'visa': /^4/,
					'mastercard': /^5[1-5]/,
					'american-express': /^3(4|7)/,
					'discover': /^6011/
				}
			};

		function Plugin ( element, options ) {
				this.element = element;
				this.$element = $(this.element);
				this.settings = $.extend( {}, defaults, options );
				this._defaults = defaults;
				this._name = pluginName;
				this.init();
		}

		$.extend(Plugin.prototype, {

				init: function () {
					var $el = this.$element;
					
					this.wrapInputElement($el)
					this.bindEvents($el);
					this.setIconDimensions($el);
				},

				bindEvents: function(el) {
					var self = this;

					el.bind('keyup', function(){
						var creditCardVendor = self.getcreditCardVendor(el.val());
					});
				},

				/**
				 * Wrap the input with a containing div
				 */
				wrapInputElement: function(el) {
					var elContainer = '<div class="'+this._name+'-container"></div>',
						elIconContainer = '<div class="'+this._name+'-icon"></div>';

					el.addClass(this._name+'-input') // Add a class to the input with the plugin name
					  .wrap(elContainer) // Wrap the input with a container div
					  .parents('.'+this._name+'-container').prepend(elIconContainer); // Add a flag icon before the input inside of the container
				},

				/**
				 * Test the credit card number against multiple vendor patterns and return the vendor if there is a match
				 * @param  {integer} creditCardNumber The value of the credit card input
				 * @return {string} The credit card vendor
				 */
				getcreditCardVendor: function (creditCardNumber) {
					var creditCardVendor;
					
					$.each(this.settings.creditCardTests, function(vendor, pattern){
						if (pattern.test(creditCardNumber)) {
							creditCardVendor = vendor;
							return false;
						}
					});

					return creditCardVendor;
				},

				/**
				 * Adjust the styles of the icon to fix perfectly inside of the input
				 * depending on its current attributes
				 */
				setIconDimensions: function(el) {
					var $icon = el.siblings('.'+this._name+'-icon'),
						inputPadding = parseInt(el.css('padding-top')),
						iconBorderWidth = (el.outerWidth() - el.innerWidth()) / 2;
						
					$icon.css({
						'height': el.height() + 'px',
						'top': inputPadding + iconBorderWidth + 'px'
					});
				}
		});

		$.fn[ pluginName ] = function ( options ) {
				return this.each(function() {
						if ( !$.data( this, "plugin_" + pluginName ) ) {
								$.data( this, "plugin_" + pluginName, new Plugin( this, options ) );
						}
				});
		};

})( jQuery, window, document );
