console.log("let's write javascript")
let currentsong = new Audio();
let song;
let currentFolder;
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


async function getsongs(folder) {
    currentFolder = folder;
    let a = await fetch(`http://127.0.0.1:5500/${currentFolder}`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    song = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            song.push(element.href.split(`/${folder}/`)[1]);
        }
    }

    //show all the songs in the playlist
    let songul = document.querySelector(".songlist").getElementsByTagName("ul")[0]
    songul.innerHTML = ""
    for (const songs of song) {
        songul.innerHTML = songul.innerHTML + `<li><img class="invert" src="images/music.svg">
                     <div class="info">
                         <div>${songs.replaceAll("%20", " ").replaceAll("(PagaiWorld.com)", " ")}</div>
                         <div>Gopu Don</div>
                     </div>
                     <div class="playnow">
                      <span>Play now</span>
                     <img class="invert" src="images/play.svg" alt="">
                     </div></li>`;
    }

    //Attach an eventlistner to each song

    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e =>{
        e.addEventListener("click", element => {
            playmusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        })
    })
}

const playmusic = (track, pause = false) => {
    //    let audio=new Audio("songs/" + track)
    currentsong.src = `/${currentFolder}/` + track
    if (!pause) {
        currentsong.play()
        play.src = "images/pause.svg"
    }

    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
}

async function displayalbums() {
    cardcontainer=document.querySelector(".cardcontainer")
    let a = await fetch(`http://127.0.0.1:5500/songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;

    let anchors = div.getElementsByTagName("a");

    let array=Array.from(anchors);
        // skip the main /songs/ link
        for (let index = 0; index < array.length; index++) {
            const e = array[index];
            
        if (e.href.includes("/songs/") && !e.href.endsWith("/songs/")) {
            // take the last non-empty part of the URL
            let parts = e.href.split("/").filter(Boolean);
            let folder = parts[parts.length - 1];
            //get the metadata of the folder
            let a = await fetch(`/songs/${folder}/info.json`);
            let response = await a.json();
            cardcontainer.innerHTML=cardcontainer.innerHTML + ` <div data-folder="${folder}" class="card">
              <div class="play">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="45"
                  height="45"
                  viewBox="0 0 80 80"
                  style="cursor: pointer"
                >
                  <a href="your-link.html" aria-label="Play">
                    <!-- Green circular background (updated color) -->
                    <circle cx="40" cy="40" r="36" fill="#1fdf64" />
                    <!-- Black play triangle -->
                    <polygon points="32,24 32,56 56,40" fill="black" />
                  </a>
                </svg>
              </div>
              <img
                src="/songs/${folder}/cover.JPG"
                alt="happyhitimage"
              />
              <h2>${response.title}</h2>
              <p>${response.description}</p>
            </div>`

        }
    }
    
     Array.from(document.getElementsByClassName("card")).forEach(card => {
        card.addEventListener("click", async (event) => {
            let folder = event.currentTarget.dataset.folder; // e.g. "cs" or "Ncs"
            await getsongs(`songs/${folder}`);   // ✅ Correct path
            playmusic(song[0]);                  // play the first track of the album
        });
    });
}

async function main() {
    //get the list of all the song
    await getsongs("songs/Ncs");
    playmusic(song[0], true)

    //display all the albums on the page
    displayalbums()

    //Attach an eventlistner to play previous and next
    play.addEventListener("click", () => {
        if (currentsong.paused) {
            currentsong.play()
            play.src = "images/pause.svg"

        } else {
            currentsong.pause()
            play.src = "images/play.svg"
        }
    })
    //listner for timeupdate event
    currentsong.addEventListener("timeupdate", () => {
        //    console.log(currentsong.currentTime,currentsong.duration)
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentsong.currentTime)}/${secondsToMinutesSeconds(currentsong.duration)}`
        document.querySelector(".circle").style.left = (currentsong.currentTime / currentsong.duration) * 100 + "%";
    })

    //Add eventlistner on seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%"
        currentsong.currentTime = (currentsong.duration) * percent / 100;
    })

    //Add an eventlistner on humburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    })
    //Add an eventlistner on humburger
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    })
    //Add eventlistner to next
    next.addEventListener("click", () => {
        console.log("nextclick")
        let indx = song.indexOf(currentsong.src.split("/").slice(-1)[0])
        console.log(song, indx)
        if ([indx + 1] < song.length ) {
            playmusic(song[indx + 1])
        }
    })
    previous.addEventListener("click", () => {
        console.log("previousclick")
        let indx = song.indexOf(currentsong.src.split("/").slice(-1)[0])
        console.log(song, indx)
        if ([indx - 1] >= 0) {
            playmusic(song[indx - 1])
        }
    })

    //Add eventlistner to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log("Setting volume to", e.target.value, "/100");
        currentsong.volume = parseInt(e.target.value) / 100
    })

    //Add eventlistner to mute the track
    document.querySelector(".volume>img").addEventListener("click",e=>{
         if(e.target.src.includes("images/volume.svg")){
              e.target.src = e.target.src.replace("images/volume.svg","images/mute.svg")
              currentsong.volume=0;
              document.querySelector(".range").getElementsByTagName("input")[0].value=0;
         }else{
            e.target.src = e.target.src.replace("images/mute.svg","images/volume.svg")
              currentsong.volume=1;
              document.querySelector(".range").getElementsByTagName("input")[0].value=20;
         }
    })
   
}
main()

