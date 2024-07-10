const clientId = '33cd7b39343a445094781f12e21affe9';
const clientSecret = 'a62ae1be00e84d1a9344d0718bb56abb';
const redirectUri = 'http://127.0.0.1:5500/index.html'; // Ensure this matches your redirect URI in the Spotify Developer Dashboard
const scopes = 'user-library-modify';

const authButton = document.getElementById('auth-button');
const songsContainer = document.getElementById('songs-container');
const showLikedSongsButton = document.getElementById('show-liked-songs-button');
const likedSongsContainer = document.getElementById('liked-songs-container');
let accessToken = '';
let tracks = [];
let currentTrackIndex = 0;
let likedSongs = [];

// Authorization
authButton.addEventListener('click', () => {
    const AUTHORIZE = "https://accounts.spotify.com/authorize";
    let url = AUTHORIZE;
    url += "?client_id=" + clientId;
    url += "&response_type=code";
    url += "&redirect_uri=" + encodeURI(redirectUri);
    url += "&show_dialog=true";
    url += "&scope=" + encodeURIComponent(scopes);
    window.location.href = url;
});

window.onload = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code) {
        console.log("Authorization code: ", code);
        try {
            const response = await fetch('https://accounts.spotify.com/api/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': 'Basic ' + btoa(clientId + ':' + clientSecret)
                },
                body: new URLSearchParams({
                    'grant_type': 'authorization_code',
                    'code': code,
                    'redirect_uri': redirectUri
                })
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`);
            }

            const data = await response.json();
            console.log("Token response: ", data);
            accessToken = data.access_token;
            localStorage.setItem('accessToken', accessToken);
            getRecommendations();
        } catch (error) {
            console.error("Error fetching the token: ", error);
        }
    } else {
        console.log("No authorization code found.");
    }
};

// Fetch Recommendations
async function getRecommendations() {
    if (!accessToken) {
        console.error("Access token is not defined");
        return;
    }

    const seedTrackId = '0pjCkLjbgSLn5c0Ilwuv8z'; // Replace with a valid track ID
    const url = `https://api.spotify.com/v1/recommendations?seed_tracks=${seedTrackId}`;

    try {
        const response = await fetch(url, {
            headers: {
                'Authorization': 'Bearer ' + accessToken
            }
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Recommendations: ", data);
        tracks = data.tracks;
        displayCurrentTrack();
    } catch (error) {
        console.error("Error fetching recommendations: ", error);
    }
}

// Display Current Track
function displayCurrentTrack() {
    songsContainer.innerHTML = ''; // Clear the container

    if (currentTrackIndex >= tracks.length) {
        songsContainer.innerHTML = '<p>No more tracks available</p>';
        return;
    }

    const song = tracks[currentTrackIndex];

    const songCard = document.createElement('div');
    songCard.className = 'song-card';
    songCard.setAttribute('data-id', song.id);

    const songImage = document.createElement('img');
    songImage.src = song.album.images[0].url;
    songCard.appendChild(songImage);

    const songInfo = document.createElement('div');
    songInfo.className = 'song-info';
    songInfo.innerHTML = `<h2>${song.name}</h2><p>${song.artists[0].name}</p>`;
    songCard.appendChild(songInfo);

    const actions = document.createElement('div');
    actions.className = 'actions';
    const likeButton = document.createElement('button');
    likeButton.innerText = '✔';
    likeButton.addEventListener('click', () => likeSong(song.id, song.name));
    const dislikeButton = document.createElement('button');
    dislikeButton.innerText = 'X';
    dislikeButton.addEventListener('click', () => dislikeSong(song.id));
    actions.appendChild(likeButton);
    actions.appendChild(dislikeButton);

    songCard.appendChild(actions);
    songsContainer.appendChild(songCard);
}

// Like Song
async function likeSong(trackId, trackName) {
    await fetch(`https://api.spotify.com/v1/me/tracks?ids=${trackId}`, {
        method: 'PUT',
        headers: {
            'Authorization': 'Bearer ' + accessToken
        }
    });

    // Store liked song
    likedSongs.push({ id: trackId, name: trackName });

    // Move to the next song
    currentTrackIndex++;
    displayCurrentTrack();
}

// Dislike Song
function dislikeSong(trackId) {
    // Move to the next song
    currentTrackIndex++;
    displayCurrentTrack();
}

// Show Liked Songs
showLikedSongsButton.addEventListener('click', () => {
    // Store liked songs in local storage
    localStorage.setItem('likedSongs', JSON.stringify(likedSongs));
    
    // Redirect to liked-songs.html
    window.location.href = 'liked-songs.html';
});





