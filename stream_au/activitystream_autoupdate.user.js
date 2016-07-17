// ==UserScript==
// @name        JoinSquad Stream Autoupdate
// @updateURL   https://raw.githubusercontent.com/SINE/JoinSquad_JS/master/stream_au/stream_au.meta.js
// @namespace   github.com/SINE
// @version     1
// @require			https://code.jquery.com/jquery-1.7.1.min.js
// @require			https://raw.githubusercontent.com/goldfire/howler.js/master/howler.min.js
// @resource		chirpnotific1 https://raw.githubusercontent.com/SINE/JoinSquad_JS/master/media/soundeffect-pop.wav
// @include     http://forums.joinsquad.com/discover/*
// @grant       GM_getResourceURL
// @run-at			document-end
// @noframe
// ==/UserScript==

this.$ = this.jQuery = jQuery.noConflict(true);

console.log("ActivitystreamAutoUpdate script start");
if( !nomultirun() ) { throw new Error("There is already a script attached! Stopping."); }

// this var function line MUST be at top before being called the first time, otherwise it will NOT work!
var UnixNow_Seconds = function() { return Math.round((new Date()).getTime() / 1000); };


$(document).ready(function() {

  start();

});


function start() {
  var listWrapper = document.getElementsByClassName("ipsStream")[0];
  if( listWrapper !== null ) {
    MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
    var observer = new MutationObserver(handleMutations);
    observer.observe(listWrapper, {childList: true, subtree: false});
  }

}

/** ********************************************** **/
/**                 FUNCTIONS                      **/

function chirp(){
  var notification = new Audio(GM_getResourceURL("chirpnotific1"));
  notification.volume = 0.1;
  var lastchirp = Number(getCookie("lastchirpactivitystream"));

  if( (UnixNow_Seconds > (lastchirp+0)) || !(lastchirp) ) {
    setCookie("lastchirpactivitystream", UnixNow_Seconds, 1);

    notification.play();
  } else {
    console.log("not ready for chirp");
  }
}


function handleMutations(mutations) {
	mutations.forEach(function (mutation) {
		console.log(	"---mutation---: \nadded nodes: "+mutation.addedNodes+"\nremoved nodes: "+mutation.removedNodes+"\ntype:"+mutation.type+"\n---mutation info end---");
		if (!mutation.addedNodes || mutation.addedNodes.length === 0) {	console.log("mutation exception, length null or no added nodes! returning!");	return;	}
		else console.log("added nodes length: "+mutation.addedNodes.length);

		if( mutation.addedNodes.length > 1 ){
			makeArray(mutation.addedNodes).forEach(function (node) {
						pre_handle_activitybutton(node);
			});
		} else {
        pre_handle_activitybutton(node);
		}
	});
}

function pre_handle_activitybutton(node) {
    //console.log("pre_handle_activitybutton");
		var loadMoreButtons = node.parentElement.querySelectorAll(".ipsStreamItem_loadMore");
		//console.log("loadmore: "+loadMoreButtons.length);
		if( loadMoreButtons ) {
			loadMoreButtons = makeArray( loadMoreButtons );
			loadMoreButtons.forEach(function(loadMoreButton){
				//console.log("loadmore button found!");
				handle_activitybutton(loadMoreButton);
			});
		}
}

function handle_activitybutton(loadMoreButton) {
  //console.log("handle_activitybutton loadMoreButton: " + loadMoreButton);

  loadMoreButton.click();
  chirp();
  //console.log("handle_activitybutton end");
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
