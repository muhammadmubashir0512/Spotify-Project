let currentSong = new Audio();
let songs;
let currfolder;

// function for fetching songs from info.json
async function getsongs(folder) {
    currfolder = folder;

    let response = await fetch(`/Music/${folder}/info.json`);
    let data = await response.json();
    songs = data.songs;

    let songUl = document.querySelector(".songsList").getElementsByTagName("ul")[0];
    songUl.innerHTML = "";
    for (const song of songs) {
        let displayName = decodeURIComponent(song).replace(".mp3", "").slice(0, 8);
        songUl.innerHTML = songUl.innerHTML + `<li data-song="${song}">
                            <img class="invert" src="music.svg" alt="">
                            <div class="info">
                                <div class="SongName">${displayName}</div>
                                <div class="SongArtist">Song Artist</div>
                            </div>
                            <div class="playnow">
                                <span>Play Now</span>
                                <img class="invert" src="play.svg" alt="">
                            </div>
                        </li>`;
    }

    Array.from(document.querySelector(".songsList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", () => {
            playMusic(e.dataset.song);
        });
    });

    return songs;
}

// function for playing music
function playMusic(track) {
    currentSong.src = `/Music/${currfolder}/` + track;
    currentSong.play();
    play.src = "pause.svg";

    document.querySelector(".songinfo").innerHTML = decodeURIComponent(track).replace(".mp3", "").slice(0, 20);
    document.querySelector(".songtime").innerHTML = "00:00/00:00";
}

// function for updating songtime
function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');
    return `${formattedMinutes}:${formattedSeconds}`;
}

async function main() {

    await getsongs("library");
    playMusic(songs[0]);
    currentSong.pause();
    play.src = "play.svg";

    // Display all albums
    async function displayAlbum() {
        const folders = ["library", "Afusic", "AP-Dhillon", "Gill-brothers", "Hassan-Raheem", "Talha-Anjum", "Talwinder"];
        let cardContainer = document.querySelector(".cardContainer");

        for (const folder of folders) {
            try {
                let response = await fetch(`/Music/${folder}/info.json`);
                let data = await response.json();
                cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
                    <div class="play">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" color="#000000" fill="#000" stroke="#141B34" stroke-width="1.5" stroke-linejoin="round">
                        <path d="M18.8906 12.846C18.5371 14.189 16.8667 15.138 13.5257 17.0361C10.296 18.8709 8.6812 19.7884 7.37983 19.4196C6.8418 19.2671 6.35159 18.9776 5.95624 18.5787C5 17.6139 5 15.7426 5 12C5 8.2574 5 6.3861 5.95624 5.42132C6.35159 5.02245 6.8418 4.73288 7.37983 4.58042C8.6812 4.21165 10.296 5.12907 13.5257 6.96393C16.8667 8.86197 18.5371 9.811 18.8906 11.154C19.0365 11.7084 19.0365 12.2916 18.8906 12.846Z" />
                        </svg>
                    </div>
                    <img src="/Music/${folder}/cover.jpg.jpg" alt="">
                    <h2>${data.title}</h2>
                    <p>${data.description}</p>
                </div>`;
            } catch (e) {
                console.log("info.json nahi mila:", folder);
            }
        }

        Array.from(document.getElementsByClassName("card")).forEach(e => {
            e.addEventListener("click", async item => {
                songs = await getsongs(e.dataset.folder);
                if (songs.length > 0) {
                    playMusic(songs[0]);
                    currentSong.play();
                    play.src = "pause.svg";
                }
            });
        });
    }
    displayAlbum();

    // play/pause button
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "pause.svg";
        } else {
            currentSong.pause();
            play.src = "play.svg";
        }
    });

    // timeupdate
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `
        ${secondsToMinutesSeconds(currentSong.currentTime)}/ ${secondsToMinutesSeconds(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    currentSong.addEventListener("ended", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if (index + 1 < songs.length) {
            playMusic(songs[index + 1]);
        }
    });

    // hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0px";
    });

    // close button
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-100%";
    });

    // seekbar
    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = (currentSong.duration) * percent / 100;
    });

    // previous button
    document.querySelector("#previous").addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if (index - 1 >= 0) {
            playMusic(songs[index - 1]);
        }
    });

    // next button
    document.querySelector("#next").addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if (index + 1 < songs.length) {
            playMusic(songs[index + 1]);
        }
    });

    // volume range
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100;
    });

    // mute button
    document.querySelector(".volume>img").addEventListener("click", (e) => {
        if (e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replace("volume.svg", "mute.svg");
            currentSong.volume = 0;
        } else {
            e.target.src = e.target.src.replace("mute.svg", "volume.svg");
            currentSong.volume = 0.25;
        }
    });
}

main();