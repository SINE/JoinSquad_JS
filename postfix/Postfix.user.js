// ==UserScript==
// @name        JoinSQUAD Postfix
// @namespace   github.com/SINE
// @include     http://forums.joinsquad.com/*
//@updateURL   https://raw.githubusercontent.com/SINE/JoinSquad_JS/master/postfix/postfix.meta.js
// @version     1.0
// @run-at			document-end
// @priority    9002
// @grant       GM_getResourceText
// @grant       GM_addStyle
// @noframes
// ==/UserScript==


if( !nomultirun() ) { throw new Error("There is already a script attached! Stopping."); }

String.prototype.beginsWith = function (string) {
		// http://stackoverflow.com/a/10646346
    return(this.indexOf(string) === 0);
};
Element.prototype.remove = function() {
    this.parentElement.removeChild(this);
};
NodeList.prototype.remove = HTMLCollection.prototype.remove = function() {
    for(var i = this.length - 1; i >= 0; i--) {
        if(this[i] && this[i].parentElement) {
            this[i].parentElement.removeChild(this[i]);
        }
    }
};

var outerPostWrapper = document.querySelector(".cTopic > div[data-role='commentFeed'] > form");
if( outerPostWrapper ) {
	pre_handlepost(outerPostWrapper);
  MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
  var observer = new MutationObserver(parseMutations);
  observer.observe(outerPostWrapper, {childList: true, subtree: false});
}


function pre_handlepost(node) {
		var postsList = node.querySelectorAll("article[id^='elComment_']");
		//console.log("PostsList length: "+postsList.length);
		if( postsList ) {
			postsList = makeArray( postsList );
			postsList.forEach(function(postDiv){
			//	console.log("post found!");
				handlepost(postDiv);
			});
		}
}

function handlepost(postDiv) {
//  console.log("handlepost postDiv: " + postDiv);

  /*var avatarfix = parsePostMetaData(postDiv, "avatarfix");
  if (avatarfix) {

    var newImgContainer = document.createElement("div");
    newImgContainer.className = "navtr ipsUserPhoto";

    newImgContainer.style.backgroundImage = "url\(\"" + avatarfix[0] + "\"\)";

    console.log("new container: " + newImgContainer.outerHTML);
    //  avatardiv.parentElement.appendChild(newImgContainer);
    avatarfix[1].parentNode.replaceChild(newImgContainer, avatarfix[1]);
  } else {
		console.log("no avatarfix.");
	}*/
/*
  var usergroup = parsePostMetaData(postDiv, "grouptitle");
  if (usergroup.toLowerCase() !== "member") {
    if (usergroup.toLowerCase() === "moderator") {
      postDiv.parentElement.classList.add("postBox_mod", "prlx");
    } else if (usergroup.toLowerCase() === "support") {
      postDiv.parentElement.classList.add("postBox_support", "prlx");
    } else if (usergroup.toLowerCase() === "developer") {
      postDiv.parentElement.classList.add("postBox_dev", "prlx");
    }
  }*/

  var hearabout = parsePostMetaData(postDiv, "hearabout");
  //console.log("hearabout: " + hearabout);
  if (hearabout) {
    hearabout.remove();
  }

  //console.log("handlepost end");
}


function parsePostMetaData(postDiv,datatype) {
	if( datatype === null ) { console.log("parsePostMetaData failed, datatype empty"); return false;}
	else { console.log("parsePostMetaData going"); }

	var returndata = null;
	if( datatype === "grouptitle" ) {
		returndata = postDiv.querySelector(".user_details .group_title > span").innerHTML;
	}
	else if (datatype === "hearabout") {
		var hearabout = null;
  //  console.log("hearabout1: "+hearabout);
		makeArray(postDiv.querySelectorAll(".cAuthorPane_info .ft")).forEach(function(object){
			if(object.innerHTML === "Where did you hear about us?:") {
				hearabout = object.parentElement;
  //      console.log("hearabout2: "+hearabout);
			}
		});
		returndata = hearabout;
	}
  else if (datatype === "avatarfix") {
    avatarinfo = [];
    makeArray(postDiv.querySelectorAll(".user_details .ipsUserPhoto")).forEach(function(object){
		//	console.log(	"useravatar found: "	);

			if( object.src.indexOf("gravatar") > -1 ) {
        //console.log("avatar found, replacing joinsquad avatar: "+object.src);
        //test1 = object.src.replace('?s=100', '?s=150');
        test1 = object.src.replace('?s=100&', '?');
        test2 = (object);

        avatarinfo[0] = test1;
        avatarinfo[1] = test2;

        return;
			} else {
        //console.log("avatar found, replacing joinsquad avatar: "+object.src);
        test1 = ( object.src.replace('photo-thumb-', 'photo-') );
        test2 = (object);

        if( test1 ) avatarinfo[0] = test1; else avatarinfo[0] = object.src;
        avatarinfo[1] = test2;

        return;
      }
		});
    if( avatarinfo.length > 0 ) {  console.log("avatarinfo length: "+avatarinfo.length); returndata = avatarinfo;}
  }
	if( returndata ) console.log("returndata: "+returndata);
	return returndata;
}

function parseMutations(mutations) {
	mutations.forEach(function (mutation) {
		console.log(	"---mutation---: \nadded nodes: "+mutation.addedNodes+"\nremoved nodes: "+mutation.removedNodes+"\ntype:"+mutation.type+"\n---mutation info end---");
		if (!mutation.addedNodes || mutation.addedNodes.length === 0) {	console.log("mutation exception, length null or no added nodes! returning!");	return;	}
		else console.log("added nodes length: "+mutation.addedNodes.length);

		if( mutation.addedNodes.length > 1 ){
			makeArray(mutation.addedNodes).forEach(function (node) {
				if (node.nodeName.toLowerCase() === 'article') {
						pre_handlepost(node);
				}
			});
		} else {
			//console.log(	"addedNode[0]: "+mutation.addedNodes[0]	);
			if (mutation.addedNodes[0].nodeName.toLowerCase() === 'div') {
				//console.log("Node is div!");
				pre_handlepost(mutation.addedNodes[0]);
			}
		}
	});
}


function nomultirun() {
	if( document.body.getAttribute("data-joinsquad-posthighlight-fired") === null ) {
		console.log("firstrun, attaching data");
		document.body.setAttribute( "data-joinsquad-posthighlight-fired",(new Date().getTime().toString()) );
		return true;
	}
	else {
		console.log("multirun blocked, parameter already set: "+document.body.getAttribute("data-joinsquad-posthighlight-fired"));
		return false;
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
