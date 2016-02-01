// ==UserScript==
// @name        JoinSQUAD_JS parallax-preview
// @namespace   github.com/SINE
//@license       https://www.gnu.org/licenses/gpl-3.0.txt
// @include     http://forums.joinsquad.com/*
// @supportURL   https://github.com/SINE/Joinsquad_JS/issues
//@updateURL     https://github.com/SINE/JoinSquad_JS/raw/master/parallax-preview/parallax-preview.meta.js
// @version     3
// @run-at			document-start
// @grant       GM_getResourceText
// @grant       GM_addStyle
// @require			https://code.jquery.com/jquery-2.2.0.min.js
// @resource		customCSS parallax2.css
// @noframes
// ==/UserScript==

this.$ = this.jQuery = jQuery.noConflict(true);

console.log("ParallaxEffect script start");


$(document).ready(function(){
  GM_addStyle(	GM_getResourceText("customCSS")	);


  //console.log("document-height: "+$(document).height());

  updatescroll();

  function updatescroll(){
    auto_doc_height = Math.max(5000, $(document).height());

    scrollrelation = parseFloat($(window).scrollTop()/(auto_doc_height-$(window).height()));

  //  console.log("scrollrelation: "+scrollrelation);

    $('#background').css('background-position', 'center center, center center, 0 ' + parseFloat(scrollrelation*100) + '%');
  //  $('#background').css('background-position', 'center center, center '+((scrollrelation/2)*parseFloat($(window).height()))+'px, 0 ' + parseFloat(scrollrelation*100) + '%');
  }

  $(window).scroll(function(){
    updatescroll();
  });


});
