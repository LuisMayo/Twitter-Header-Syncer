const LoginWithTwitter = require('login-with-twitter')
const { readFileSync } = require('fs');
const express = require('express');
const memorystore = require('memorystore');
const session = require('express-session');
const admin = require('firebase-admin');
const { config } = require('process');
const http = require('http');
const https = require('https');

admin.initializeApp({
    credential: admin.credential.applicationDefault()
});

const db = admin.firestore();


const conf = JSON.parse(readFileSync('./conf/conf.json', { encoding: 'utf-8' }));
const app = express();
const store = memorystore(session)

const tw = new LoginWithTwitter({
    consumerKey: conf.consumerKey,
    consumerSecret: conf.consumerSecret,
    callbackUrl: conf.callbackUrl
});

app.use(session({
    cookie: { maxAge: 86400000 },
    store: new store({
        checkPeriod: 86400000 // prune expired entries every 24h
    }),
    resave: false,
    saveUninitialized: false,
    secret: conf.secretCookie
}));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html')
});

app.get('/twitter', (req, res) => {
    tw.login((err, tokenSecret, url) => {
        if (err) {
            // Handle the error your way
        }

        // Save the OAuth token secret for use in your /twitter/callback route
        req.session.tokenSecret = tokenSecret

        // Redirect to the /twitter/callback route, with the OAuth responses as query params
        res.redirect(url);
    })
});

app.get('/twitter/callback', (req, res) => {
    tw.callback({
        oauth_token: req.query.oauth_token,
        oauth_verifier: req.query.oauth_verifier
    }, req.session.tokenSecret, (err, user) => {
        if (err) {
            // Handle the error your way
        }

        // Delete the tokenSecret securely
        delete req.session.tokenSecret

        req.session.user = user

        // The user object contains 4 key/value pairs, which
        // you should store and use as you need, e.g. with your
        // own calls to Twitter's API, or a Twitter API module
        // like `twitter` or `twit`.
        // user = {
        //   userId,
        //   userName,
        //   userToken,
        //   userTokenSecret
        // }
        let addDoc = db.collection('twusers').doc(user.userId).set({ ...user, lastUpdate: new Date().toISOString() }).then(ref => {
            if (conf.appurl) {
                res.redirect(conf.appurl)
            } else {
                res.sendFile(__dirname + '/' + conf.appFile);
            }
        });
        // Redirect to whatever route that can handle your new Twitter login user details!
    });
});

app.get('/logout', (req, res) => {
    try {
     let deleteDoc = db.collection('twusers').doc(req.session.user.userId).delete();
    } catch(e) {
        
    }
    res.redirect('/');
});

const httpServer = http.createServer(app);
httpServer.listen(conf.port)
if (conf.httpsPort) {
    const privateKey  = readFileSync(conf.certificate.keyPath, 'utf8');
    const certificate = readFileSync(conf.certificate.certPath, 'utf8');
    const credentials = {key: privateKey, cert: certificate};
    const httpsServer = https.createServer(credentials, app);
    httpsServer.listen(conf.httpsPort);
}
