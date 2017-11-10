// Initialize Firebase
var config = {
    apiKey: "AIzaSyALpqEcR7wNpWmPfvL2ka23TvQ3yTg7uKE",
    authDomain: "psu-by.firebaseapp.com",
    databaseURL: "https://psu-by.firebaseio.com",
    projectId: "psu-by",
    storageBucket: "psu-by.appspot.com",
    messagingSenderId: "361692093726"
};
firebase.initializeApp(config);


// Get a reference to the database service
const database = firebase.database();


function loadSchedule() {
    return database.ref('/schedule/').once('value').then(function (snapshot) {
        //container.innerHTML = JSON.stringify(snapshot.val());
        database.goOffline();
        return snapshot;
    });
}