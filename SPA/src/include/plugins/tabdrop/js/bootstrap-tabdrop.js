/* =========================================================
 * bootstrap-tabdrop.js 
 * http://www.eyecon.ro/bootstrap-tabdrop
 * =========================================================
 * Copyright 2012 Stefan Petre
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ========================================================= */
 
/* CHANGES
 * Added option to show selected tab's title on the dropdown toggle
 * Added option to preserve i18n data on the tab title
 * Propagated options object through the tabdrop
 * Added and propagated a span element to contain the tabtitle
 * Made layout run twice to account for changes in text
 */
 
!function( $ ) {

	var WinReszier = (function(){
		var registered = [];
		var inited = false;
		var timer;
		var resize = function(ev) {
			clearTimeout(timer);
			timer = setTimeout(notify, 100);
		};
		var notify = function() {
			for(var i=0, cnt=registered.length; i<cnt; i++) {
				registered[i].apply();
			}
		};
		return {
			register: function(fn) {
				registered.push(fn);
				if (inited === false) {
					$(window).bind('resize', resize);
					inited = true;
				}
			},
			unregister: function(fn) {
				for(var i=0, cnt=registered.length; i<cnt; i++) {
					if (registered[i] == fn) {
						delete registered[i];
						break;
					}
				}
			}
		}
	}());

	var TabDrop = function(element, options) {
		this.element = $(element);
		this.options = options;
		this.dropdown = $('<li class="dropdown hide pull-right tabdrop"><a class="dropdown-toggle" data-toggle="dropdown" href="#"><span>'+options.text+'</span> <b class="caret"></b></a><ul class="dropdown-menu"></ul></li>')
							.prependTo(this.element);
		this.span = this.dropdown.find('span');
		if (this.element.parent().is('.tabs-below')) {
			this.dropdown.addClass('dropup');
		}
		WinReszier.register($.proxy(this.layout, this));
		this.layout();
		this.element.on('shown.bs.tab', $.proxy(this.layout, this));
	};

	TabDrop.prototype = {
		constructor: TabDrop,

		layout: function() {
        this._layout(true);
        this._layout();
		},
		_layout: function(reset) {
			var collection = [];
			this.dropdown.removeClass('hide');
			if(reset){
				this.span.html(this.options.text);
				if( this.options.keepi18n )
					this.span.attr('data-i18n', null);
			}
			this.element
				.append(this.dropdown.find('li'))
				.find('>li')
				.not('.tabdrop')
				.each(function(){
					if(this.offsetTop > 0) {
						collection.push(this);
					}
				});
			if (collection.length > 0) {
				collection = $(collection);
				this.dropdown
					.find('ul')
					.empty()
					.append(collection);
				if (this.dropdown.find('.active').length == 1) {
					this.dropdown.addClass('active');
					
					if( this.options.showTitle ){
						var a = this.dropdown.find('.active a')
						this.span.html(a.text());
						if( this.options.keepi18n && a.attr('data-i18n'))
							this.span.attr('data-i18n', a.attr('data-i18n'));
					}
				} else {
					this.dropdown.removeClass('active');
				}
			} else {
				this.dropdown.addClass('hide');
			}
		}
	}

	$.fn.tabdrop = function ( option ) {
		return this.each(function () {
			var $this = $(this),
				data = $this.data('tabdrop'),
				options = typeof option === 'object' && option;
			if (!data)  {
				$this.data('tabdrop', (data = new TabDrop(this, $.extend({}, $.fn.tabdrop.defaults,options))));
			}
			if (typeof option == 'string') {
				data[option]();
			}
		})
	};

	$.fn.tabdrop.defaults = {
		text: '<i class="icon-align-justify"></i>'
	};

	$.fn.tabdrop.Constructor = TabDrop;

}( window.jQuery );