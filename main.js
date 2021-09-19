const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = "F8-Play-Music";
const player = $(".player");
const cd = $(".cd");
const heading = $("header h2");
const cdThumb = $(".cd-thumb");
const audio = $("#audio");
const playBtn = $(".btn-toggle-play");
const progress = $("#progress");
const prevBtn = $(".btn-prev");
const nextBtn = $(".btn-next");
const randomBtn = $(".btn-random");
const repeatBtn = $(".btn-repeat");
const playlist = $(".playlist");

// List nhạc

const app = {
  currentIndex: 0,
  isPlaying: false,
  isRandom: false,
  isRepeat: false,
  config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
  songs: [
    {
      name: "Nhớ Lời Cha Mẹ Dạy",
      singer: "Cao Đại Hưng",
      path: "./asstes/music/song1.mp3",
      image: "./asstes/img/song1.png",
    },
    {
      name: "Sai Người Sai Thời Điểm",
      singer: "Thanh Hưng",
      path: "./asstes/music/song2.mp3",
      image: "./asstes/img/song2.jpg",
    },
    {
      name: "Im Lặng Và Ra Đi",
      singer: "Khánh Phương",
      path: "./asstes/music/song3.mp3",
      image: "./asstes/img/song3.jpg",
    },
    {
      name: "Thà Rằng Như Thế",
      singer: "Ưng Hoàng Phúc",
      path: "./asstes/music/song4.mp3",
      image: "./asstes/img/song4.jpg",
    },
    {
      name: "Thất Tình",
      singer: "Trịnh Đình Quang",
      path: "./asstes/music/song5.mp3",
      image: "./asstes/img/song5.jpg",
    },
    {
      name: "Look At Me Now",
      singer: "Chris Brown",
      path: "./asstes/music/song6.mp3",
      image: "./asstes/img/song6.jpg",
    },
    {
      name: "Leessang",
      singer: "Leessang",
      path: "./asstes/music/song7.mp3",
      image: "./asstes/img/song7.jpg",
    },
    {
      name: "Turn Off The T V",
      singer: "Leessang",
      path: "./asstes/music/song8.mp3",
      image: "./asstes/img/song8.jpg",
    },
    {
      name: "Thế Giới Nhỏ",
      singer: "D N",
      path: "./asstes/music/song9.mp3",
      image: "./asstes/img/song9.jpg",
    },
    {
      name: "Đường Về Nhà",
      singer: "Zephyr",
      path: "./asstes/music/song10.mp3",
      image: "./asstes/img/song10.jpg",
    },
  ],

  setConfig: function (key, value) {
    this.config[key] = value;
    localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
  },
  render: function () {
    const htmls = this.songs.map((song, index) => {
      return `
                <div class="song ${
                  index === this.currentIndex ? "active" : ""
                }" data-index="${index}"">
                <div class="thumb" style="background-image: url('${
                  song.image
                }')">
                </div>
                <div class="body">
                <h3 class="title">${song.name}</h3>
                <p class="author">${song.singer}</p>
                </div>
                <div class="option">
                <i class="fas fa-ellipsis-h"></i>
                </div>
                </div>
                  `;
    });

    playlist.innerHTML = htmls.join("");
  },

  defineProperties: function () {
    Object.defineProperty(this, "currentSong", {
      get: function () {
        return this.songs[this.currentIndex];
      },
    });
  },

  handleEvents: function () {
    const _this = this;
    const cdWidth = cd.offsetWidth;

    // xử lý cd quay và dừng

    const cdThumbAnimate = cdThumb.animate([{ transform: "rotate(360deg)" }], {
      duration: 10000,
      iterations: Infinity,
    });

    cdThumbAnimate.pause();

    //  xử lý phóng to / thu nhỏ cd
    document.onscroll = function () {
      const scrollTop = window.scrollTop || document.documentElement.scrollTop;
      const newcdWidth = cdWidth - scrollTop;
      cd.style.width = newcdWidth > 0 ? newcdWidth + "px" : 0;
      cd.style.opacity = newcdWidth / cdWidth;
    };

    // xử lý khi click play

    playBtn.onclick = function () {
      if (_this.isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
    };

    // khi bài hát đc play
    audio.onplay = function () {
      _this.isPlaying = true;
      player.classList.add("playing");
      cdThumbAnimate.play();
    };

    // khi bài hát bị dừng
    audio.onpause = function () {
      _this.isPlaying = false;
      player.classList.remove("playing");
      cdThumbAnimate.pause();
    };

    // khi tiến độ bài hát thay đổi

    audio.ontimeupdate = function () {
      if (audio.duration) {
        const progressPercent = Math.floor(
          (audio.currentTime / audio.duration) * 100
        );
        progress.value = progressPercent;
      }
    };
    // xử lý khi tua
    progress.onchange = function (e) {
      const seekTime = (audio.duration / 100) * e.target.value;
      audio.currentTime = seekTime;
    };

    // khi next song
    nextBtn.onclick = function () {
      if (_this.isRandom) {
        _this.playRandomSong();
      } else {
        _this.nextSong();
      }
      audio.play();
      _this.render();
      _this.scrollToActiveSong();
    };

    // khi prev xong
    prevBtn.onclick = function () {
      if (_this.isRandom) {
        _this.playRandomSong();
      } else {
        _this.prevSong();
      }
      audio.play();
      _this.render();
      _this.scrollToActiveSong();
    };

    //  khi random được xử lý
    randomBtn.onclick = function (e) {
      _this.isRandom = !_this.isRandom;
      _this.setConfig("isRandom", _this.isRandom);
      randomBtn.classList.toggle("active", _this.isRandom);
    };

    // xử lý phát lại 1 bài hát
    repeatBtn.onclick = function (e) {
      _this.isRepeat = !_this.isRepeat;
      _this.setConfig("isRepeat", _this.isRepeat);
      repeatBtn.classList.toggle("active", _this.isRepeat);
    };

    // xử lý next song khi audio ended
    audio.onended = function () {
      if (_this.isRepeat) {
        audio.play();
      } else {
        nextBtn.click();
      }
    };

    // lắng nghe hành vi click vào playlist

    playlist.onclick = function (e) {
      const songNode = e.target.closest(".song:not(.active)");
      if (songNode || e.target.closest(".option")) {
        // xử lý khi click vào song
        if (songNode) {
          _this.currentIndex = Number(songNode.dataset.index);
          _this.loadCurrentSong();
          _this.render();
          audio.play();
        }
        // xử lý khi click vào song option
        if (e.target.closest(".option")) {
        }
      }
    };
  },

  scrollToActiveSong: function () {
    setTimeout(() => {
      $(".song.active").scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }, 300);
  },

  loadCurrentSong: function () {
    heading.textContent = this.currentSong.name;
    cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
    audio.src = this.currentSong.path;
  },

  loadConfig: function () {
    this.isRandom = this.config.isRandom;
    this.isRepeat = this.config.isRepeat;
  },

  nextSong: function () {
    this.currentIndex++;
    if (this.currentIndex >= this.songs.length) {
      this.currentIndex = 0;
    }
    this.loadCurrentSong();
  },

  prevSong: function () {
    this.currentIndex--;
    if (this.currentIndex < 0) {
      this.currentIndex = this.songs.length - 1;
    }
    this.loadCurrentSong();
  },

  playRandomSong: function () {
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * this.songs.length);
    } while (newIndex === this.currentIndex);
    this.currentIndex = newIndex;
    this.loadCurrentSong();
  },

  start: function () {
    // gán cấu hình từ config vào ứng dụng
    this.loadConfig();

    // đinh nghĩa các thuộc tính cho Object
    this.defineProperties();

    // Lắng nghe / xử lý xự kiện dom Event
    this.handleEvents();

    // tải thông tin bài hát đầu tiên vào UI khi chạy ứng dụng
    this.loadCurrentSong();

    // render danh sách bài hát
    this.render();


    //  hiển thị trạng thái ban đầu của btn repeat random
    randomBtn.classList.toggle("active", _this.isRandom);
    repeatBtn.classList.toggle("active", _this.isRepeat);
  },
};

app.start();
