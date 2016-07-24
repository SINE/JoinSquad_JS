// ==UserScript==
// @name        JoinSquad Stream Autoupdate ALPHA
// @namespace   github.com/SINE
// @version     1.7.6
//@updateURL   https://raw.githubusercontent.com/SINE/JoinSquad_JS/master/stream_au/stream_au.meta.js
// @resource		chirpnotific1 https://raw.githubusercontent.com/SINE/JoinSquad_JS/master/media/soundeffect-pop.wav
// @resource		customCSS https://raw.githubusercontent.com/SINE/JoinSquad_JS/master/css/datguicustom.css
// @require			https://code.jquery.com/jquery-2.2.0.min.js
// @require			https://raw.githubusercontent.com/goldfire/howler.js/v1.1.29/howler.js
// @require			https://raw.githubusercontent.com/dataarts/dat.gui/v0.5.1/build/dat.gui.min.js
// @include     http://forums.joinsquad.com/discover/*
// @grant       GM_getResourceURL
// @grant       GM_getResourceText
// @grant       GM_xmlhttpRequest
// @grant       GM_setValue
// @grant       GM_getValue
// @grant       GM_addStyle
// @run-at			document-end
// @noframe
// ==/UserScript==

this.$ = this.jQuery = jQuery.noConflict(true);
var notification = new Audio(GM_getResourceURL("chirpnotific1"));

console.log("ActivitystreamAutoUpdate script start");
if( !nomultirun() ) { throw new Error("There is already a script attached! Stopping."); }

// this var function line MUST be at top before being called the first time, otherwise it will NOT work!
var UnixNow_Seconds = function() { return Math.round((new Date()).getTime() / 1000); };
var dochirp = true;
var waitingforchirp=false;
var workaround_mode = 2;
var gui;
var Settings_ASAU;
var refreshquietly;

$(document).ready(function() {
  GM_addStyle(	GM_getResourceText("customCSS")	);

  prepare_settings_gui();
  start();

});


function start() {
  activitystream_noautoupdate = (document.querySelector("#elStreamUpdateMsg").className.search("ipsHide") > -1);
  if( activitystream_noautoupdate ) {
     setInterval(function(){activitystream_workaround_update();}, (1000*Settings_ASAU.SecondsRefresh));
  }

  var listWrapper = document.getElementsByClassName("ipsStream")[0];
  if( listWrapper !== null ) {
    MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
    var observer = new MutationObserver(handleMutations);
    observer.observe(listWrapper, {childList: true, subtree: false});
  }
}

function prepare_settings_gui() {

  DefaultSettings_ASAU_template = function() {
    this.PopVolume = 30;
    this.SecondsRefresh = 45;
    this.DoHarshUpdateDefaultStream = false;
  };
  var DefaultSettings_ASAU = new DefaultSettings_ASAU_template();

  if( !GM_getValue("Settings_ASAU",0) )
    Settings_ASAU = JSON.parse(JSON.stringify(DefaultSettings_ASAU));
  else
    Settings_ASAU = GM_getValue("Settings_ASAU");

  gui = new dat.GUI({autoPlace: false});

  var gui_PopVolume = gui.add(Settings_ASAU, 'PopVolume', 0, 100);
  var gui_SecondsRefresh = gui.add(Settings_ASAU, 'SecondsRefresh', 5, 300);
  //var gui_DoHarshUpdateDefaultStream = gui.add(Settings_ASAU, 'DoHarshUpdateDefaultStream');

  var guiContainer;
  var settingsContainer;

  if( !document.body.querySelector(".settingsContainer") ) {
    settingsContainer = document.createElement("div");
    settingsContainer.classList.add("settingsContainer");
    $(settingsContainer).insertBefore( $("#elMobileNav") );

    var settingsContainerToggleButton = document.createElement("div");
    guiContainer = document.createElement("div");
    guiContainer.classList.add("guiContainer");
    guiContainer.appendChild(gui.domElement);

    settingsContainerToggleButton.classList.add("ToggleSwitch","toggled");

    settingsContainer.appendChild(guiContainer);
    settingsContainer.appendChild(settingsContainerToggleButton);

    $( ".settingsContainer .close-button" ).remove();
    $(settingsContainerToggleButton).toggleClass("toggled");
    $(".guiContainer > *").slideToggle(1);

    $(settingsContainerToggleButton).click(function(){
      $(this).toggleClass("toggled");
      $(".guiContainer > *").slideToggle(500);
    });

  } else {

    guiContainer = document.body.querySelector(".guiContainer");
    guiContainer.appendChild(gui.domElement);
    $( ".guiContainer .close-button" ).remove();
    $(".guiContainer > *").slideUp(1);
  }

  gui_PopVolume.onFinishChange(function(value) {
    Settings_ASAU.PopVolume = value;
    GM_setValue("Settings_ASAU", JSON.parse(JSON.stringify(Settings_ASAU)) );

    notification.volume = (value/100);
    chirp();
  });

  gui_SecondsRefresh.onFinishChange(function(value) {
    Settings_ASAU.gui_SecondsRefresh = value;
    GM_setValue("Settings_ASAU", JSON.parse(JSON.stringify(Settings_ASAU)) );
  });

/*
  gui_DoHarshUpdateDefaultStream.onFinishChange(function(value) {
    console.log("gui_DoHarshUpdateDefaultStream new value "+value);
    Settings_ASAU.gui_DoHarshUpdateDefaultStream = value;
    GM_setValue("Settings_ASAU", JSON.parse(JSON.stringify(Settings_ASAU)) );
  });*/


}

/** ********************************************** **/
/**                 FUNCTIONS                      **/

function chirp(){
  var notification = new Audio(GM_getResourceURL("chirpnotific1"));
  notification.volume = (Settings_ASAU.PopVolume/100);
  var lastchirp = Number(getCookie("lastchirpactivitystream"));

  if( (UnixNow_Seconds > (lastchirp+30)) || !(lastchirp) ) {
    setCookie("lastchirpactivitystream", UnixNow_Seconds, 1);

    notification.play();
  } else {
    console.log("not ready for chirp");
  }
}


function handleMutations(mutations) {
	mutations.forEach(function (mutation) {
		//console.log(	"---mutation---: \nadded nodes: "+mutation.addedNodes+"\nremoved nodes: "+mutation.removedNodes+"\ntype:"+mutation.type+"\n---mutation info end---");
		if (!mutation.addedNodes || mutation.addedNodes.length === 0) {	console.log("mutation exception, length null or no added nodes! returning!");	return;	}
		else console.log("added nodes length: "+mutation.addedNodes.length);

		if( mutation.addedNodes.length > 1 ) {
			makeArray(mutation.addedNodes).forEach(function (node) {
        if (node.nodeName.toLowerCase() === 'li') {
          pre_handle_founditem(node);
				}  else {
          //console.log( "nodename not li, but: "+node.nodeName.toLowerCase() );
        }
			});
		} else {
      if (node.nodeName.toLowerCase() === 'li') {
        pre_handle_founditem(node);
      } else {
      //  console.log( "nodename not li, but: "+node.nodeName.toLowerCase() );
      }
    }
	});
}

function pre_handle_founditem(node) {

		var loadMoreButtons = node.parentElement.querySelectorAll(".ipsStreamItem_loadMore");

    if(node.querySelector(".ipsStreamItem_header")) {
      console.log("content that is not a like was found > chirp.");
      dochirp = true;
  } else if (node.querySelector(".ipsStreamItem_action")){
      console.log("content that is a like was found -> no chirp");
      dochirp = false;
    }
    if( !waitingforchirp ) {
      waitingforchirp = true;
      setTimeout(function(){  if(dochirp===false){dochirp=true;}else{chirp();}  waitingforchirp=false; },100);
    }

		if( loadMoreButtons.length >= 1 ) {
			loadMoreButtons = makeArray( loadMoreButtons );
			loadMoreButtons.forEach(function(loadMoreButton){
        loadMoreButton.click();
			});
		}

}

function makeArray(o) {
		// Turn array-like objects into Arrays
		// cwestblog.com/2015/02/11/javascript-quirk-array-slicing-with-node-lists/
		try {
			return Array.prototype.slice.call(o);
		} catch (e) {}
		for (var i = 0, l = o.length, a = new Array(i); i < l; i+=1) {
			if (i in o) {
				a[i] = o[i];
			}
		}
		return a;
}

function nomultirun() {
	if( document.body.getAttribute("data-joinsquad-activitystreamautoupdate-fired") === null ) {
		//console.log("firstrun, attaching data");
		document.body.setAttribute( "data-joinsquad-activitystreamautoupdate-fired",(new Date().getTime().toString()) );
		return true;
	}
	else {
		//console.log("multirun blocked, parameter already set: "+document.body.getAttribute("data-joinsquad-activitystreamautoupdate-fired"));
		return false;
	}
}

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) === 0) {
            return c.substring(name.length,c.length);
        }
    }
    return "";
}


function activitystream_workaround_update() {

  var OLDipsStreamItems = document.body.querySelectorAll("ol.ipsStream > li.ipsStreamItem");
  var OLDipsStreamFirstItem = OLDipsStreamItems[0];


   GM_xmlhttpRequest({
      url: window.location.href,
      method: "GET",
      synchronous: false,
      headers: { "Accept": "text/plain" },
      timeout: 10000,
      onload: function(response) {
          rspDoc= (new DOMParser()).parseFromString( response.responseText, 'text/html');
          if( rspDoc.body.querySelector("ol.ipsStream > li.ipsStreamItem .ipsStreamItem_title a").toString().localeCompare(OLDipsStreamFirstItem.querySelector(".ipsStreamItem_title a").toString()) !== 0 )
          {
            NEWipsStreamItems = rspDoc.body.querySelectorAll("ol.ipsStream > li.ipsStreamItem");

            var addactivities_cache = [];
            var i_old = 0;
            if( NEWipsStreamItems.length >= 1 ) {
              for(i=0; i<NEWipsStreamItems.length-1; i++) {
                console.log("inside for loop, i: "+i);
                 var oldItemLink = OLDipsStreamItems[0].querySelector(".ipsStreamItem_title a").toString();
                 var newItemLink = NEWipsStreamItems[i].querySelector(".ipsStreamItem_title a").toString();


              var newest_item = NEWipsStreamItems[0].querySelector(".ipsStreamItem_title a").toString();
              var liste_alter_items = [];

              makeArray(OLDipsStreamItems).forEach(function(node){
                liste_alter_items.push(node.querySelector(".ipsStreamItem_title a").toString());
              });

              if(liste_alter_items.indexOf(newest_item) >= 0) refreshquietly = true;
              else refreshquietly = false;

              if( oldItemLink.localeCompare(newItemLink) !== 0 ) {
                oldIpsStreamContainer = document.body.querySelector("ol.ipsStream");
                newIpsStreamContainer = rspDoc.body.querySelector("ol.ipsStream");

                $(newIpsStreamContainer).insertBefore( oldIpsStreamContainer );
                $(oldIpsStreamContainer).remove();
                if(!refreshquietly)
                  chirp();
                break;
              } else {
                break;
              }
            }
          }
        } else {
        }
    }
  });

}
