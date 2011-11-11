/*!
 * jQuery Mobile v@VERSION
 * http://jquerymobile.com/
 *
 * Copyright 2010, jQuery Project
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 */

(function( $, window, undefined ) {

function css3TransitionsHandler( name, reverse, $to, $from ) {

	// All transition handlers are required to return a
	// deferred promise object so the caller can tell when the
	// transition is complete.

	var deferred = new $.Deferred(),

		// Are we being asked to run the transition in reverse?
		// if so, we'll need to make sure we place the "reverse" class
		// on our "to" and "from" elements.

		reverseClass = reverse ? " reverse" : "",

		// Some transitions require extra styling on the parent of
		// the elements being transitioned. We place a generic class
		// on the parent that someone can use as a styling hook for
		// when any transition is running, and another class that ends
		// with the name of the transition so that transitions can enable
		// properties specifically for the transition.

		viewportClass = "ui-mobile-viewport-transitioning viewport-" + name,

		// We'll be manipulating both the "to" and "from" elements in
		// the same way, several times, so we use a cached collection
		// of both elements.

		$both = $to.add( $from ),

		// Typically, we listen for the completion of the transition to
		// the "to" element, but in some cases, the "to" element is never
		// animated, so no transition complete is ever recieved. We need
		// to set a timer to catch this case so we don't end up waiting
		// for this notification that will never come.

		doneTimer = 0,
		
		// We use a timer to place the 'animate' class on the 'to' and
		// 'from' elements to kick-off any CSS3 transitions. We need to
		// track the timer id so we can kill it, just in case the doneFunc
		// fires.

		animateTimer = 0,

		// When the transition completes, we need to do some clean-up
		// of the CSS classes we placed on the "to" and "from" elements.

		doneFunc = function() {
			// In most cases, this function will have been fired
			// off by the event that signals the completion of the
			// transition to the "to" element. We need to make sure
			// we clear the doneTimer so that it doesn't fire this
			// function a 2nd time.

			if ( doneTimer ) {
				clearTimeout( doneTimer );
				doneTimer = 0;
			}

			// Make sure to clear the animation timer just in
			// case the doneFunc fires before it does.

			if ( animateTimer ) {
				clearTimeout( animateTimer );
				animateTimer = 0;
			}

			// Only one page can ever have the activePageClass on it,
			// so remove it from the "from" element and then place it
			// on the "to" element.

			if ( $from && $from[ 0 ] !== $to[ 0 ] ) {
				$from.removeClass( $.mobile.activePageClass );
			}

			$to.addClass( $.mobile.activePageClass );

			// Now strip off the transition classes used to animate
			// the elements.

			$both.removeClass( "out in reverse animate " + name );

			$to.parent().removeClass( viewportClass );

			// Tell the caller of the transition handler that we're
			// all done.

			deferred.resolve( name, reverse, $to, $from );
		};

	// Set up a "transitionend" callback on the "to" element so we know when it
	// is done transitioning.

	$to.transitionComplete( doneFunc );

 	// Some page-transitions don't actually trigger any CSS3 transitions on the
	// "to" element, so we fire off a timer to manually trigger our done callback
	// if we haven't recieved a "transitionend" notification within the alotted time.

	doneTimer = setTimeout(function() {
		if( $.support.cssTransitions ) {
			$to.unbind( "transitionend webkitTransitionEnd OTransitionEnd", doneFunc );
		}
		doneFunc();
	}, css3TransitionsHandler.transitionThreshold );

	// Add the animation classes that set up the transition interval and initial
	// values for the properties that will be transitioned.

	$to.parent().addClass( viewportClass );

	if ( $from ) {
		$from.addClass( name + " out" + reverseClass );
	}

	$to.addClass( name + " in" + reverseClass );

	// Fire off a timer that will add the "animate" class which triggers the CSS
	// rules for the "to" and "from" elements that specify new CSS property values
	// that will kick-off the transitions.

	animateTimer = setTimeout(function() {
		animateTimer = 0;
		$both.addClass( "animate" );
	}, css3TransitionsHandler.animateClassInterval );

	// After we've set up and started the transitions, return a promise to the
	// caller so they can tell when our async transition is done.

	return deferred.promise();
}

// msecs tow wait before placing the "animate" class on the "to" and "from" element
// to kick-off any transitions.

css3TransitionsHandler.animateClassInterval = 25;

// msecs to wait for a "transitionend" event before manually firing off the done callback.

css3TransitionsHandler.transitionThreshold = 1000;

// Make our transition handler public.

$.mobile.css3TransitionsHandler = css3TransitionsHandler;

// We want to avoid the situation where we accidentally override a default
// handler specified by the developer, so we only replace the default if it
// is currently the defaultTransitionHandler().

if ( $.mobile.defaultTransitionHandler === $.mobile.noneTransitionHandler ) {
	$.mobile.defaultTransitionHandler = css3TransitionsHandler;
}

})( jQuery, this );
