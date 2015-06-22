// Important Facts


// || Web Audio API || //

// On iOS, the Web Audio API requires sounds to be triggered 
// from an explicit user action, such as a tap. Calling play() from an onload event will not play sound.
// The audio() must first be play() from a explicit user action before the audio unlocks forever.

// We need to use something that will allow us to ask users for premission to use AUDIO on IOS ONLY
// line 73 | game-playlists.js |