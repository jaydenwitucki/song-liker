document.addEventListener('DOMContentLoaded', () => {
    const likedSongsContainer = document.getElementById('liked-songs-container');
    const backButton = document.getElementById('back-button');
    const recommendButton = document.getElementById('recommend-button');
    const recommendationsContainer = document.getElementById('recommendations-container');
    const likedSongs = JSON.parse(localStorage.getItem('likedSongs')) || [];

    // Display liked songs
    likedSongs.forEach(song => {
        const songElement = document.createElement('div');
        
        songElement.textContent = song.name;
        songElement.className = 'song-element';
        likedSongsContainer.appendChild(songElement);
        
    });

    recommendButton.addEventListener('click', async () => {
        const recommendedTracks = await getRecommendations(likedSongs.map(song => song.id));
        displayRecommendations(recommendedTracks);
    });

    async function fetchWebApi(endpoint, method, body) {
        const accessToken = localStorage.getItem('accessToken'); // Assuming you store the token in localStorage
        const res = await fetch(`https://api.spotify.com/${endpoint}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            method,
            body: JSON.stringify(body)
        });
        return await res.json();
    }

    async function getRecommendations(trackIds) {
        if (trackIds.length === 0) {
            alert("No liked songs to base recommendations on.");
            return [];
        }
        const endpoint = `v1/recommendations?limit=5&seed_tracks=${trackIds.join(',')}`;
        try {
            const response = await fetchWebApi(endpoint, 'GET');
            console.log("Recommendations response:", response); // Log the entire response for debugging
            if (!response || !response.tracks) {
                console.error("Invalid response structure:", response);
                return [];
            }
            return response.tracks;
        } catch (error) {
            console.error("Error fetching recommendations:", error);
            return [];
        }
    }

    function displayRecommendations(tracks) {
        recommendationsContainer.innerHTML = ''; // Clear previous recommendations
        if (!tracks || tracks.length === 0) {
            recommendationsContainer.textContent = 'No recommendations available.';
            return;
        }
        tracks.forEach(track => {
            const trackElement = document.createElement('div');
            trackElement.className = 'song-element';
            trackElement.textContent = `${track.name} by ${track.artists.map(artist => artist.name).join(', ')}`;
            recommendationsContainer.appendChild(trackElement);
        });
    }
    backButton.addEventListener('click', () => {
        window.location.href = 'index.html'; // Redirect back to the main page
    });

});

