let currentSong = new Audio();
let songs = [];
let currentFolder;
let album = [];



// get song from system
async function getSongs(folder) {
    currentFolder = folder;
    songs = [];
    let song = await fetch(`http://127.0.0.1:3000/songs/${folder}`);
    let response = await song.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    for (let i = 0; i < as.length; i++) {
        const element = as[i];
        if (element.href.endsWith(".m4a")) {
            songs.push(element.href.split(`/${folder}/`)[1]);
        } else if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1]);
        }
    }
    let musicUl = document.querySelector(".music").getElementsByTagName("ul")[0];
    // enter the song into list of library
    musicUl.innerHTML = ""
    for (const song of songs) {
        extension = song.replaceAll("%20", " ").split('.')[1];
        musicUl.innerHTML = musicUl.innerHTML + `<li class="flex radius">
            <div class="descrption flex">
                <img src="https://i.scdn.co/image/ab67706f0000000254473de875fea0fd19d39037"class="imgLib">
                <div>
                    <h3>${song.replaceAll("%20", " ").split('.')[0]}</h3>
                    <p>It's easy</p>
                </div>
            </div>
            <img src="/SVG/play.svg" class="svgImg">
        </li>`;
    }

    Array.from(document.querySelector(".music").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", el => {
            console.log(e.querySelector(".descrption div").firstElementChild.innerHTML);
            playSong(e.querySelector(".descrption div").firstElementChild.innerHTML + ".m4a")
        })
    })
    return songs
}

// display the playlist dynamicaaly
async function displayAlbums() {
    let song = await fetch(`http://127.0.0.1:3000/songs/`);
    let response = await song.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    // console.log(div)
    let as = div.getElementsByTagName("a");
    for (let i = 0; i < as.length; i++) {
        hr = as[i].href;
        // console.log(hr);
        if (hr.includes("/songs")) {
            // console.log(hr);
            let folder = (hr.split("/songs/")[1].split("/")[0]);
            let song = await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`);
            let response = await song.json();
            // console.log(response.title)
            document.querySelector(".playlist").innerHTML = document.querySelector(".playlist").innerHTML + `<div class="card wt" data-="${folder}">
            <div class="playImg">
                <img src="/songs/${folder}/cover.jpg" alt="pl1">
            </div>
            <div class="info">
                <h3>${response.title}</h3>
                <p class="textClr2">${response.description}</p>
            </div>
            <button class="control">
                <img src="SVG/play.svg" alt="play"></button>
        </div>`
        }
        // card logic

        Array.from(document.getElementsByClassName("card")).forEach(e => {
            e.addEventListener("click", async (i) => {
                console.log(i.currentTarget)
                songs = await getSongs(i.currentTarget.dataset[""]);
                playSong(songs[0])
            });
        });
    }
}


async function main() {

    // get all the songs
    await getSongs("marathi");
    playSong(songs[0], true);


    // display the playlist dynamicaaly
    await displayAlbums();

    // conver 122s into 2:02s
    function secondsToMinutesSeconds(seconds) {
        if (isNaN(seconds) || seconds < 0) {
            return "00:00"
        }
        let minutes = Math.floor(seconds / 60) < 10 ? '0' + Math.floor(seconds / 60) : Math.floor(seconds / 60);
        let remainingSeconds = Math.floor(seconds % 60);
        let formattedSeconds = remainingSeconds < 10 ? '0' + remainingSeconds : remainingSeconds;
        return `${minutes}:${formattedSeconds}`;
    }
    // play pause logic
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "/svg/pause.svg"
        }
        else {
            currentSong.pause();
            play.src = "/svg/play.svg"

        }
    })

    // previous logic
    previous.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split(`/songs/${currentFolder}/`)[1]);
        if (index == 0) {
            index = songs.length - 1
        } else {
            --index;
        }
        playSong(songs[index])
    });

    // next Logic
    next.addEventListener("click", () => {

        let index = songs.indexOf(currentSong.src.split(`/songs/${currentFolder}/`)[1]);
        if (index == songs.length - 1) {
            index = 0
        } else {
            ++index;
        }
        playSong(songs[index])
    });

    // auto next
    currentSong.addEventListener("ended", () => {
        let index = songs.indexOf(currentSong.src.split("/songs/")[1]);
        if (index == songs.length - 1) {
            index = 0
        } else {
            ++index;
        }
        playSong(songs[index])
    });

    // current Song Duration
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songTime").innerHTML = secondsToMinutesSeconds(currentSong.currentTime) + ` / ` + secondsToMinutesSeconds(currentSong.duration);
        document.querySelector(".circle").style.left = ((currentSong.currentTime / currentSong.duration) * 98) + "%";
    });

    document.querySelector(".seekBar").addEventListener("click", (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = (percent * currentSong.duration) / 100;
    })

    // volume logic
    document.querySelector(".level").addEventListener("change", (e) => {
        currentSong.volume = ((e.target.value) / 100);
    })


    document.querySelector(".volumeImg").addEventListener("click", (e) => {
        let imgSrc = document.querySelector(".volumeImg").src
        // http://127.0.0.1:3000/SVG/volume.svg
        if (imgSrc.includes("volume.svg")) {
            currentSong.volume = 0;
            document.querySelector(".level").value = 0;
            document.querySelector(".volumeImg").src = "/SVG/mute.svg"
        } else {
            document.querySelector(".level").value = 10;
            document.querySelector(".volumeImg").src = "/SVG/volume.svg"
            currentSong.volume = .10;
        }
    })

    // HamBurger
    document.querySelector(".ham").addEventListener("click", () => {
        let left = document.querySelector(".left").style;
        left.left = "0%";
    });


    document.querySelector("#cross").addEventListener("click", () => {
        let left = document.querySelector(".left").style;
        left.left = "-100%";

    });


}
//play the song 
const playSong = (track, pause = false) => {
    currentSong.pause();
    currentSong.currentTime = 0.5;
    currentSong.src = `/songs/${currentFolder}/` + track;
    if (!pause) {
        currentSong.play();
        play.src = "/svg/pause.svg"
    }
    document.querySelector(".songInfo").innerHTML = decodeURI(track).split('.')[0];
}
main()

