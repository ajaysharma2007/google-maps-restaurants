## Restaurant search

### Install deps
```npm install```

### Running the App

#### Backend sever
```npm run backend```
* Runs a **express.js** server on port `3002`
* Currently exposes a single end point `/yelp-query`


#### Front end server
```npm start```

* Runs the app in the development mode on port `3000`
* Open [http://localhost:3000](http://localhost:3000) to view it in the browser.
* The page will reload if you make edits.<br>
* You will also see any lint errors in the console.


### Notes about the code
#### Backend
* Backend is small, most of the code in `src/server.js`
* Separate backend is needed to workaround `CORS` issue and to `rateLimit` the  access to *Yelp API*
* Server *doesn't* auto reload, ideally there will be no changes in here, if changed you need restart using the command mentioned above

#### Frontend
* Almost all of the logic is in front end like most node apps, entry point in `index.js`
* Core container component is  `App.js`
	* Defines core state using `UseState` from [React Hooks](https://reactjs.org/docs/hooks-intro.html)
* Two main components
	* `MapView`
		* Has the `google-react-maps` imported with a sample map rendering
		* Shows how to display a marker (currently a marker for the loc is rendered)
		* Give's you access to the underlying core google maps api to add handlers to listen to any events (See example [here](https://github.com/google-map-react/google-map-react-examples/blob/master/src/examples/Main.js#L69))
	* `ListView`
		* Currently just displays name of the restuarants
* Loading of Data
	* Uses [React Hook's](https://reactjs.org/docs/hooks-intro.html) `UseEffect` to auto reload biz data when location changes
	* The logic is again present in `App.js`
* Control flow
	* Plumbing of the stateChangers (`setLoc` etc) should take care of handling the control flow logic


### Modifications
* Feel free to define any new state or effects needed
* Do not remove the throttling in the backend, if needed simulate the call by replacing the `axios` http call with previously captured data
* Keys are defined in `constants.js`
