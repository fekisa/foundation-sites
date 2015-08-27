!function(Foundation, $) {
  'use strict';

  function Reveal(element) {
    this.$element = element;
    this.options = $.extend({}, Reveal.defaults, this.$element.data());

    this._init();

    this.$element.trigger('init.zf.reveal');
  }

  Reveal.defaults = {
    animationIn: 'fadeIn',
    animationOut: 'fadeOut',
    animationInDelay: 250,
    animationOutDelay: 250,
    closeOnClick: true,
    closeOnEsc: true,
    multiOpened: false,
    closeBtn: true,
    closeBtnTemplate: '',
    vOffset: 100,
    hOffset: 0,
    fullScreen: false,
    btmOffsetPct: 10,
    closeText: '✖',
    overlay: true
  };
  function randomIdGen(length){
    return Math.round((Math.pow(36, length + 1) - Math.random() * Math.pow(36, length))).toString(36).slice(1);
  }

  Reveal.prototype._init = function(){
    var anchorId = randomIdGen(6);
    this.id = this.$element.attr('id');
    this.$anchor = $('[data-open=' + this.id + ']') || $('[data-toggle=' + this.id + ']');
    this.$anchor.attr({
      'data-close': this.id,
      'aria-controls': this.id,
      'id': anchorId
    });
    this.options.fullScreen = this.$element.hasClass('full');
    if(this.options.overlay && !this.options.fullScreen){
      this.$overlay = this.makeOverlay(this.id);
    }
    this.$element.attr({
      'role': 'dialog',
      'aria-hidden': true,
      'aria-labelledby': anchorId
      })
    this.options.vOffset = this.options.fullScreen ? 0 : Number(this.$element.css('margin-top').split('px')[0]);
    if(this.options.fullScreen){
      this.options.overlay = false;
    }
    if(this.options.closeBtn || this.options.fullScreen){
      this.$closeBtn = this.makeButton(this.id);
      this.$element.append(this.$closeBtn);
    }
    this._events();
  };

  //overlay and button elements to be added to the body/modal
  Reveal.prototype.makeOverlay = function(id){
    var $overlay = $('<div></div>')
                    .addClass('reveal-overlay')
                    .attr({'tabindex': -1, 'aria-hidden': true})
                    .appendTo('body');
    if(this.options.closeOnClick){
      $overlay.attr({
        'data-close': id
      });
    }
    return $overlay;
  };
  Reveal.prototype.makeButton = function(id){
    var btn = $('<a>' + this.options.closeText + '</a>')
              .addClass('close-button')
              .attr({'data-close': this.id});
    return btn;
  };


  //event listeners and additional triggers that need to be managed
  Reveal.prototype._events = function(){
    var _this = this;
    this.$element.on({
      'open.zf.trigger': this.open.bind(this),
      'close.zf.trigger': this.close.bind(this),
      'toggle.zf.trigger': this.toggle.bind(this)
    });
    if(this.options.closeOnClick && this.options.overlay){
      this.$overlay.on('click.zf.reveal', this.close.bind(this));
    }
    if(this.$closeBtn){
      this.$closeBtn.on('click.zf.reveal', this.close.bind(this));
    }
  };

  Reveal.prototype._addGlobalClickHandler = function(){
    var _this = this;
    this.$element.on('click.zf.reveal', function(e){
      e.preventDefault();
      return false;
    });
    $('body').on('click.zf.reveal', function(e){
      _this.close();
    });
  };

  Reveal.prototype._addKeyHandler = function(){
    var _this = this;
    $(window).on('keyup.zf.reveal', function(e){
      e.preventDefault();
      e.stopPropagation();
      if(e.which === 27){
        _this.close();
      }
      return false;
    });
  };

  //open and close function
  Reveal.prototype.open = function(){
    this.$element.trigger('closeme.zf.reveal', this.id);
    var _this = this;
    this.isActive = true;
    var dims = Foundation.GetDimensions(this.$element);
    var checkMe = this.$element.hasClass('full') ? 'reveal full' : (dims.height >= (0.5 * dims.windowDims.height)) ? 'reveal' : 'center';
    this.$element
        .css({'visibility': 'hidden'})
        .show()
        .scrollTop(0);

    if(checkMe === 'reveal full'){
      this.$element
          .offset(Foundation.GetOffsets(this.$element, null, checkMe, this.options.vOffset))
          .css({
            'height': dims.windowDims.height,
            'width': dims.windowDims.width
          });
    }else if(!Foundation.MediaQuery.atLeast('medium')){
      this.$element
          .css({
            'width': dims.windowDims.width - (this.options.hOffset + 2)
          })
          .offset(Foundation.GetOffsets(this.$element, null, 'center', this.options.vOffset, this.options.hOffset));
          // .offset({
          // 'top': dims.windowDims.offset.top + this.options.vOffset,
          // 'left': this.options.hOffset + 1
          // })
    }else{
      this.$element
          .offset(Foundation.GetOffsets(this.$element, null, checkMe, this.options.vOffset))
          .css({
            'max-height': dims.windowDims.height - (this.options.vOffset * (this.options.btmOffsetPct / 100 + 1))
          });
    }
    if(_this.options.overlay){
      _this.$overlay.fadeIn('fast').attr({'aria-hidden': false});
      $('body').attr({'aria-hidden': true});
    }
    this.$element
        .hide()
        .css({
          'visibility': ''
        })
        .fadeIn('fast', function(){
          _this.$element.attr({'aria-hidden': false})

          //conditionals for user updated settings
          if(_this.$element.hasClass('full')){
            // console.log(this.$element.offset(), this.options.vOffset);
          }

          if(!_this.options.overlay && _this.options.closeOnClick){
            _this._addGlobalClickHandler();
          }
          if(_this.options.closeOnEsc){
            _this._addKeyHandler();
          }
        });
    $('body').addClass('is-reveal-open');
    Foundation.reflow();
    // $.fn.foundation();
  };
  Reveal.prototype.close = function(){
    this.isActive = false;
    this.$element.fadeOut(this.options.animationOutDelay).attr({'aria-hidden': true}).css({'height': '', 'width': ''});
    if(this.options.overlay){
      this.$overlay.fadeOut(this.options.animationOutDelay).attr({'aria-hidden': true});
    }
    if(this.options.closeOnEsc){
      $(window).off('keyup.zf.reveal');
    }
    if(!this.options.overlay && this.options.closeOnClick){
      $('body').off('click.zf.reveal');
    }

    $('body').removeClass('is-reveal-open').attr({'aria-hidden': false});
    // console.log(this.$overlay.css('background-color'));
    // console.log('closing');
  };
  Reveal.prototype.toggle = function(){
    // console.log('toggling');
    if(this.isActive){
      this.close();
    }else{
      this.open();
    }
  };
  Foundation.plugin(Reveal);

  // // Exports for AMD/Browserify
  // if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
  //   module.exports = Reveal;
  // if (typeof define === 'function')
  //   define(['foundation'], function() {
  //     return Reveal;
  //   });
  //
}(Foundation, jQuery);
