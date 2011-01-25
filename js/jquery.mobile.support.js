/*
* jQuery Mobile Framework : support tests
* Copyright (c) jQuery Project
* Dual licensed under the MIT (MIT-LICENSE.txt) and GPL (GPL-LICENSE.txt) licenses.
* Note: Code is in draft form and is subject to change 
*/
(function($, undefined ) {



var fakeBody = $( "<body>" ).prependTo( "html" ),
	fbCSS = fakeBody[0].style,
	vendors = ['webkit','moz','o'],
	webos = window.palmGetResource || window.PalmServiceBridge, //only used to rule out scrollTop 
	bb = window.blackberry; //only used to rule out box shadow, as it's filled opaque on BB

//thx Modernizr
function propExists( prop ){
	var uc_prop = prop.charAt(0).toUpperCase() + prop.substr(1),
		props   = (prop + ' ' + vendors.join(uc_prop + ' ') + uc_prop).split(' ');
	for(var v in props){
		if( fbCSS[ v ] !== undefined ){
			return true;
		}
	}
};

//test for dynamic-updating base tag support (allows us to avoid href,src attr rewriting)
function baseTagTest(){
	var fauxBase = location.protocol + '//' + location.host + location.pathname + "ui-dir/",
		base = $("head base"),
		fauxEle = null,
		href = '';
	if (!base.length) {
		base = fauxEle = $("<base>", {"href": fauxBase}).appendTo("head");
	}
	else {
		href = base.attr("href");
	}
	var link = $( "<a href='testurl'></a>" ).prependTo( fakeBody ),
		rebase = link[0].href;
	base[0].href = href ? href : location.pathname;
	if (fauxEle) {
		fauxEle.remove();
	}
	return rebase.indexOf(fauxBase) === 0;
};

//support test for whether a hash change makes a history entry
//not called until the page navigation needs to make sure ajax usage is safe
function testHashMakesHistory(){
	var win = window,
		count = 0,
		addItem = function(){
			win.location.hash += "*";
		},
		prevHash,
		histLength,
		historyMade;
	
	//set prevHash to current hash
	prevHash = win.location.hash;

	//disable hash listening	
	$.mobile.urlHistory.listeningEnabled = false;	
	
	//bind to resulting hashchange, set back again after 2 changes
	$( win ).bind("hashchange.hashMakesHistory",function(){
		count++;
		if( count == 2 ){
			$.mobile.urlHistory.listeningEnabled = true;
			$( win ).unbind("hashchange.hashMakesHistory");	
		}	
	});		
	
	//change hash, clears forward "history"		
	addItem();
	
	//get hist length
	histLength = win.history.length;
	
	//add another item for comparison
	addItem();
	
	//define support bool
	historyMade = histLength < win.history.length;
	
	//if it made a history entry, we can go back one to remove the faux entry
	if( historyMade ){
		history.go( -2 );
	}
	//otherwise, just put things where they were before because it doesn't matter
	else{
		win.location.hash = prevHash;
	}
	
	return historyMade;
};

$.extend( $.support, {
	orientation: "orientation" in window,
	touch: "ontouchend" in document,
	cssTransitions: "WebKitTransitionEvent" in window,
	pushState: !!history.pushState,
	mediaquery: $.mobile.media('only all'),
	cssPseudoElement: !!propExists('content'),
	boxShadow: !!propExists('boxShadow') && !bb,
	scrollTop: ("pageXOffset" in window || "scrollTop" in document.documentElement || "scrollTop" in fakeBody[0]) && !webos,
	dynamicBaseTag: baseTagTest()
});

fakeBody.remove();

//for ruling out shadows via css
if( !$.support.boxShadow ){ $('html').addClass('ui-mobile-nosupport-boxshadow'); }

$(function(){
	$.support.hashMakesHistory = testHashMakesHistory();
});

})( jQuery );