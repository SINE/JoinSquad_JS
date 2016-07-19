// ==UserScript==
// @name        JoinSquad Stream Autoupdate ALPHA
// @namespace   github.com/SINE
// @version     1.6.2
//@updateURL   https://raw.githubusercontent.com/SINE/JoinSquad_JS/master/stream_au/stream_au.meta.js
// @require			https://code.jquery.com/jquery-1.7.1.min.js
// @require			https://raw.githubusercontent.com/goldfire/howler.js/master/howler.min.js
// @resource		chirpnotific1 https://raw.githubusercontent.com/SINE/JoinSquad_JS/master/media/soundeffect-pop.wav
// @include     http://forums.joinsquad.com/discover/*
// @grant       GM_getResourceURL
// @grant       GM_xmlhttpRequest
// @run-at			document-end
// @noframe
// ==/UserScript==

this.$ = this.jQuery = jQuery.noConflict(true);

console.log("ActivitystreamAutoUpdate script start");
if( !nomultirun() ) { throw new Error("There is already a script attached! Stopping."); }

// this var function line MUST be at top before being called the first time, otherwise it will NOT work!
var UnixNow_Seconds = function() { return Math.round((new Date()).getTime() / 1000); };
var dochirp = true;
var waitingforchirp=false;
var workaround_mode = 2;

$(document).ready(function() {

  start();

});


function start() {
  activitystream_noautoupdate = (document.querySelector("#elStreamUpdateMsg").className.search("ipsHide") > -1);
  if( activitystream_noautoupdate ) {
    //alert("activitystream no autoupdate, enabling interval");
     setInterval(function(){activitystream_workaround_update();}, 10000);
  }

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
  notification.volume = 0.3;
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
		console.log(	"---mutation---: \nadded nodes: "+mutation.addedNodes+"\nremoved nodes: "+mutation.removedNodes+"\ntype:"+mutation.type+"\n---mutation info end---");
		if (!mutation.addedNodes || mutation.addedNodes.length === 0) {	console.log("mutation exception, length null or no added nodes! returning!");	return;	}
		else console.log("added nodes length: "+mutation.addedNodes.length);

		if( mutation.addedNodes.length > 1 ) {
			makeArray(mutation.addedNodes).forEach(function (node) {
        if (node.nodeName.toLowerCase() === 'li') {
          pre_handle_founditem(node);
				}  else {
          console.log( "nodename not li, but: "+node.nodeName.toLowerCase() );
        }
			});
		} else {
      if (node.nodeName.toLowerCase() === 'li') {
        pre_handle_founditem(node);
      } else {
        console.log( "nodename not li, but: "+node.nodeName.toLowerCase() );
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

//console.log("oldipsStreamFirstItem: "+OLDipsStreamFirstItem);
//console.log("OLDipsStreamFirstItem.querySelector('.ipsStreamItem_title a')"+OLDipsStreamFirstItem.querySelector(".ipsStreamItem_title a"));

  //console.log("OLDipsStreamFirstItem:"+OLDipsStreamFirstItem);
if( workaround_mode == 1 ) {
  //console.log("workaround mode 1 called");

  GM_xmlhttpRequest({
     url: window.location.href,
     method: "GET",
     synchronous: false,
     headers: { "Accept": "text/plain" },
     timeout: 10000,
     onload: function(response) {
      //  console.log("HTTP response received!");
         rspDoc= (new DOMParser()).parseFromString( response.responseText, 'text/html');
         if( rspDoc.body.querySelector("ol.ipsStream > li.ipsStreamItem .ipsStreamItem_title a").toString().localeCompare(OLDipsStreamFirstItem.querySelector(".ipsStreamItem_title a").toString()) !== 0 )
         {
        //   console.log("http request finished > newest item isn't old item");
           NEWipsStreamItems = rspDoc.body.querySelectorAll("ol.ipsStream > li.ipsStreamItem");
          // console.log("NEWipsStreamItems.length: "+NEWipsStreamItems.length );
           var addactivities_cache = [];
           var i_old = 0;
           if( NEWipsStreamItems.length >= 1 ) {
             for(i=0; i<NEWipsStreamItems.length-1; i++) {
            //   i_old = i_old + 1;
               console.log("inside for loop, i: "+i);
                var oldItemLink = OLDipsStreamItems[0].querySelector(".ipsStreamItem_title a").toString();
                var newItemLink = NEWipsStreamItems[i].querySelector(".ipsStreamItem_title a").toString();
              ///  console.log("oldItemLink: "+oldItemLink);
              //  console.log("newItemLink: "+newItemLink);

               if( oldItemLink.localeCompare(newItemLink) !== 0 ) {
              //   console.log("trying to insert activity");
                //console.log("trying to insert activity - NEWipsStreamItems[i].outerHTML: "+NEWipsStreamItems[i].innerHTML+" // OLDipsStreamFirstItem: "+OLDipsStreamFirstItem);
                addactivities_cache.push( NEWipsStreamItems[i].outerHTML );
                //i_old = i_old - 1;
               } else {
            //     console.log("inside for loop, breaking @ i: "+i);
                 break;
               }
             }
          //  console.log("cache anwenden: ");
             addactivities_cache.forEach(function (this_activity) {
            //   console.log("cache anwenden this activity: "+this_activity);
               $(this_activity).insertBefore( OLDipsStreamFirstItem );
             });
             if(addactivities_cache.length >= 1) {chirp();}
          //   console.log("cache angewendet.");

           }

         } else {
           //console.log("http request finished > newest item is old item");
         }
       //console.log("HTTP response parsed");
     }
   });
 } else if ( workaround_mode == 2 ) {
  // console.log("workaround mode 2 called");
   GM_xmlhttpRequest({
      url: window.location.href,
      method: "GET",
      synchronous: false,
      headers: { "Accept": "text/plain" },
      timeout: 10000,
      onload: function(response) {
       //  console.log("HTTP response received!");
          rspDoc= (new DOMParser()).parseFromString( response.responseText, 'text/html');
          if( rspDoc.body.querySelector("ol.ipsStream > li.ipsStreamItem .ipsStreamItem_title a").toString().localeCompare(OLDipsStreamFirstItem.querySelector(".ipsStreamItem_title a").toString()) !== 0 )
          {
         //   console.log("http request finished > newest item isn't old item");
            NEWipsStreamItems = rspDoc.body.querySelectorAll("ol.ipsStream > li.ipsStreamItem");
           // console.log("NEWipsStreamItems.length: "+NEWipsStreamItems.length );
            var addactivities_cache = [];
            var i_old = 0;
            if( NEWipsStreamItems.length >= 1 ) {
              for(i=0; i<NEWipsStreamItems.length-1; i++) {
             //   i_old = i_old + 1;
                console.log("inside for loop, i: "+i);
                 var oldItemLink = OLDipsStreamItems[0].querySelector(".ipsStreamItem_title a").toString();
                 var newItemLink = NEWipsStreamItems[i].querySelector(".ipsStreamItem_title a").toString();
               ///  console.log("oldItemLink: "+oldItemLink);
               //  console.log("newItemLink: "+newItemLink);

                if( oldItemLink.localeCompare(newItemLink) !== 0 ) {
                  oldIpsStreamContainer = document.body.querySelector("ol.ipsStream");
                  newIpsStreamContainer = rspDoc.body.querySelector("ol.ipsStream");

                  $(newIpsStreamContainer).insertBefore( oldIpsStreamContainer );
                  $(oldIpsStreamContainer).remove();
                  chirp();
                  break;
                } else {
             //     console.log("inside for loop, breaking @ i: "+i);
                  break;
                }
              }
            }

          } else {
            //console.log("http request finished > newest item is old item");
          }
        //console.log("HTTP response parsed");
      }
    });
 }

}
