<div align="center"><img  src="https://github.com/user-attachments/assets/464cb121-85dc-47f3-b124-14a6de6b3bdd"/> </div>

<h1 align="center">Tweeter Deleeter</h1>

<h4 align="center">A Chrome extension to bulk delete Twitter (currently X) activity - tweets, retweets, replies, quotes, media & likes  <sup>(they're private now but you never know) <sup></h4>

<p align="center">
Chrome Web Store  
<a href="https://chromewebstore.google.com/detail/tweeter-deleeter/abgmheddoaokgganklgbjbnkdfjijign"> link</a></p>

## Features

* One-click deletion of all your posts
* Remove all likes
* Progress tracking
* Secure: runs locally in your browser

## Installation

1. Download from the Chrome Web Store 

OR 
1. Clone this repository
2. Build using `npm run build`
3. Load the `build` fodler as  unpacked in `chrome://extensions/`

## Usage

1. Login to X (Twitter)
2. Click extension icon
3. Wait for the extension to find the necessary headers used to interact with the X api
4. Click "Delete Content"

## Limitations

* X API rate limits may apply
* Large accounts may require multiple sessions
* Only works with Chrome/Chromium browsers (Although you can copy paste the [JS code](https://github.com/eelmafia/TweeterDeleeter) in any browser console)

## Privacy

* I don't care about your data, nothing is recorded or saved
* All operations performed client-side
* No third-party servers involved
* Literally open source
