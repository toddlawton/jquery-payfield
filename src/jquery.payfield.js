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

					this.settings.letterWidth = (parseInt($el.css('font-size')) / 1.5);
					
					this.addInputAttributes($el);
					this.wrapInputElement($el)
					this.bindEvents($el);
					this.setIconDimensions($el);
				},

				bindEvents: function(el) {
					var self = this;
					
					el.on('click', function(e){
						if (self.settings.cardNumberCompleted) {
							self.settings.cardNumberCompleted = !self.settings.cardNumberCompleted;
							self.hideAdditionalFields();
						}
					})
					.on('keydown', function(e){
						var keypressed = e.which;
						self.checkForSpaces(e);
					})
					.on('keyup blur', function(){
						var creditCardVendor = self.getcreditCardVendor(el.val());
						self.switchCreditCardIcon(creditCardVendor);
						if (self.$element.val().length === 19) {
							self.showAdditionalFields(true);
							self.settings.cardNumberCompleted = true;
						}
					});

					el.closest('.'+this._name+'-container').find('.credit-card-expiration').on('keyup', function(e) {
						self.checkForSlashes(e);
					});

					el.closest('.'+this._name+'-container').find('input').each(function(){
						var pattern = new RegExp($(this).attr('pattern'));

						$(this).on('keydown', function(e) {
							// If not tab, delete and backspace key and not an integer, prevent keypress
							if (e.which !== 39 && e.which !== 37 && e.which !== 9 && e.which !== 8 && e.which !== 46 && !pattern.test(String.fromCharCode(e.which))) {
								e.preventDefault();
								return false;
							}
						});
					});
				},

				/**
				 * Apply element attributes to the input
				 */
				addInputAttributes: function(el) {
					this.settings.maxlength = 19;
					el.attr('maxlength', this.settings.maxlength);
				},

				/**
				 * Wrap the input with a containing div
				 */
				wrapInputElement: function(el) {
					var self = this,
						elContainer = '<div class="'+this._name+'-container"></div>',
						elIconContainer = '<div class="'+this._name+'-icon type-credit"></div>',
						inputList = [{
							name: 'credit-card-expiration',
							placeholder: 'MM/YY',
							maxlength: 5,
							pattern: '^[0-9]*$',
							type: 'tel'
						},
						{
							name: 'credit-card-cvv',
							placeholder: 'CVV',
							maxlength: 3,
							pattern: '^[0-9]*$',
							type: 'tel'
						}],
						inputMarkup = '';

					$.each(inputList, function(index, attrs) {
						inputMarkup += '<input class="'+attrs.name+'" placeholder="'+attrs.placeholder+'" maxlength="'+attrs.maxlength+'" pattern="'+attrs.pattern+'" type="'+attrs.type+'" style="width:'+((attrs.maxlength+1)*self.settings.letterWidth)+'px" />';
					});

					inputMarkup = '<div class="additional-credit-card-fields">' + inputMarkup;
					inputMarkup = inputMarkup + '</div>';

					el.addClass(this._name+'-input') // Add a class to the input with the plugin name
					  .css('min-width', this.$element.outerWidth() + 'px')
					  .attr('pattern', '^[0-9]*$') // Allow only integers in the card input
					  .wrap(elContainer) // Wrap the input with a container div
					  .closest('.'+this._name+'-container').prepend(elIconContainer) // Add a flag icon before the input inside of the container
					  									   .append(inputMarkup) // Add additional credit card fields
					  									   .css('min-width', this.$element.outerWidth() + 'px');


					// Cache selectors for the newly added elements
				    this.$icon = el.siblings('.'+this._name+'-icon');
				    this.$additionalFields = el.siblings('.additional-credit-card-fields');
				    this.$expirationField = this.$additionalFields.find('.credit-card-expiration');

				    // Apply a fixed with for the containing div of the additional fields
				    var totalInputWidth = 0;
				    this.$additionalFields.find('input').each(function(){
				    	totalInputWidth += $(this).width();
				    });
				    this.$additionalFields.css('min-width', totalInputWidth+self.settings.letterWidth*2+'px');
				    this.hideAdditionalFields(); // Hide by default until card number is completed
					
					// Store attributes of the new elements for later use
					this.settings.inputPadding = parseInt(el.css('padding-top'));
					this.settings.iconBorderWidth = (el.outerWidth() - el.innerWidth()) / 2;
					this.settings.iconWidth = el.height() * 1.6590909091;
					this.settings.iconHeight = el.height();
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
				 * Replace the current icon with a new one if there is a vendor match
				 * @param  {string} vendor The vendor returned by getcreditCardVendor
				 */
				switchCreditCardIcon: function(vendor) {
					this.$icon.removeClass().addClass(this._name+'-icon');
					if (vendor) {
						this.$icon.addClass('type-'+vendor);
					}
				},

				/**
				 * Add/remove spaces between sets of 4 digits
				 * @param  {event} e The keyup or keydown event object
				 */
				checkForSpaces: function(e) {
					var newValue = this.$element.val();

					if (e.which == 8 || e.which == 46) { 
						// When backspace or delete keypressed, check for / remove existing spaces
						if ((newValue.length-1) % 5 === 0 && (newValue.length-1) > 0) {
							var valSplit = this.$element.val().split('');
							valSplit[newValue.length-2] = '';
							valSplit = valSplit.join('');
							this.$element.val(valSplit);
						}
					} else {
						if ((newValue.length+1) % 5 === 0 && (newValue.length+1) < this.settings.maxlength) {
							this.$element.val(this.$element.val()+' ');
						}
					}
				},

				/**
				 * Add/remove slashes in expiration field
				 * @param  {event} e The keyup or keydown event object
				 */
				checkForSlashes: function(e) {
					var $input = $(e.currentTarget),
						newValue = $input.val();

					if (e.which == 8 || e.which == 46) { 
						if ((newValue.length-1) % 3 === 0 && (newValue.length-1) > 0) {
							var valSplit = newValue.split('');
							valSplit[newValue.length-2] = '';
							valSplit = valSplit.join('');
							$input.val(valSplit);
						}
					} else {
						if ((newValue.length+1) % 3 === 0 && (newValue.length+1) < $input.attr('maxlength')) {
							$input.val($input.val()+'/');
						}
					}
				},

				/**
				 * Adjust the styles of the icon to fix perfectly inside of the input
				 * depending on its current attributes
				 */
				setIconDimensions: function(el) {
					el.css('padding-left', this.settings.iconWidth + this.settings.inputPadding * 2 + 'px');
					
					this.$icon.css({
						'width': this.settings.iconWidth + 'px',
						'height': this.settings.iconHeight + 'px',
						'top': this.settings.inputPadding + this.settings.iconBorderWidth + 'px'
					});
				},

				/**
				 * Hide all but the last 4 digits of the card number and move additional fields into view.
				 * @param  {boolean} triggerFocus Set to true if next input focus desired
				 */
				showAdditionalFields: function(triggerFocus) {
					this.$element.css('text-indent', - this.settings.letterWidth * 12 + 'px');
					this.$additionalFields.css('left', this.settings.iconWidth + this.settings.inputPadding * 2 + (this.settings.letterWidth + 1) * 5 + 'px').addClass('visible');
					if (triggerFocus) {
						this.$expirationField.trigger('focus');
					}
				},

				/**
				 * Reveal full card number for editing, hide additional fields
				 */
				hideAdditionalFields: function() {
					this.$element.css('text-indent', '0px');
					this.$additionalFields.css('left', this.$element.outerWidth() + 'px').removeClass('visible');
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
