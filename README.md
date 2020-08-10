# Twitter header Syncer
This project will allow the user to log with Twitter and specify an URL pointing to an image. Then a function will update all registered user's header pictures each 24 hours by downloading an image from the specified URL and uploading it to Twitter

Currently running on https://apps.luismayo.com/img-to-header

## Deployment 

In order to use this project you should follow several steps, first to set the login server up, then the firebase function.
Before starting you should already have made a Firebase project

### Login server

This will only work in a compute engine instance with nodejs installed.

1. Git clone the repo on your machine

```
git clone https://github.com/LuisMayo/Twitter-Header-Syncer.git
```

2. cd into folder and npm install

```
cd Twitter-Header-Syncer;
npm i;
```

3. Copy conf-dummy.json to conf.json and fill the fields. This fields are required, rest are optional or deafult value may work:
```
    "consumerKey": null,
    "consumerSecret": null,
    "callbackUrl": null,
    "secretCookie": null,
```

3. 1. (Optional)If you're planning to deploy the server behind a reverse proxy, you should pass the real path of the app through the `X-Real-Directory` header

4. Launch the server with `node index.js`

### Syncing function

1. If you haven't yet, use `firebase login` to log into firebase.
2. Change `.firebaserc` to specify your own project-id
3. Deploy using `firebase deploy --only functions`

## Contributing
Since this is a tiny project we don't have strict rules about contributions. Just open a Pull Request to fix any of the project issues or any improvement you have percieved on your own. Any contributions which improve or fix the project will be accepted as long as they don't deviate too much from the project objectives. If you have doubts about whether the PR would be accepted or not you can open an issue before coding to ask for my opinion
