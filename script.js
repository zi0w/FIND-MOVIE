let movies = [];
let currentMovie = null; // 모달에 표시된 영화 정보를 저장할 전역 변수(맨위로 올려야댐)
const bookmarkBtn = document.querySelector(".header-bookmark-btn");
const movieContainer = document.querySelector(".movie-container");

const options = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization:
      "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIwNTEwNjllNjBmNzFlMjk3NWRkNTUyM2I1ZTczNzQ4NSIsIm5iZiI6MTcyOTA1ODI3Ny4wMzQ3OTgsInN1YiI6IjY3MGY0ZWYxMDQzMzFkYjRiMTEyNjg2NyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.R5AdKtVPHNTL017i66FsKELD9B3kqfMzH1UUFjOJx68",
  },
};

fetch(
  //url 변경
  "https://api.themoviedb.org/3/movie/top_rated?language=ko-KR&page=1",
  options
)
  .then((response) => response.json())
  .then((response) => {
    movies = response.results;
    displayMovies(movies);
  })
  .catch((err) => {
    console.error("에러 발생: ", err);
    alert("에러가 발생했습니다. 다시 시도해 주세요.");
  });

function displayMovies(movieList) {
  const movieContainer = document.querySelector(".movie-container");
  movieContainer.innerHTML = "";

  movieList.forEach((element) => {
    const tempHtml = `
    <div class="card-box" data-id="${element.id}">
      <div class="card-image-box">
        <img class="movie-image" 
        src="https://image.tmdb.org/t/p/w500${element.poster_path}" 
        alt="${element.title} 포스터 이미지"/>
      </div>
      <div class="card-text-box">
        <h4 class="movie-title">${element.title}</h4>
        <p class="movie-rating">평점: ${element.vote_average}</p>
      </div>
    </div> 
    `;
    movieContainer.innerHTML += tempHtml;
  });
}

// 검색 필터링 함수(대소문자, 띄어쓰기 무시)
function filterMovies(searchInput) {
  const searchKeywords = searchInput.toLowerCase().replace(/\s/g, "");
  const filterMovies = movies.filter((movie) =>
    movie.title.toLowerCase().replace(/\s/g, "").includes(searchKeywords)
  );
  displayMovies(filterMovies);
}

// 실시간 검색(디바운싱)
let debounceTimer;

document.querySelector(".header-input").addEventListener("input", function () {
  clearTimeout(debounceTimer);

  debounceTimer = setTimeout(() => {
    const searchInput = document.querySelector(".header-input").value;
    filterMovies(searchInput);
  }, 500);
});

//모달 열기/닫기
const modal = document.querySelector(".modal");
const modalClose = document.querySelector(".closing-btn");

modalClose.addEventListener("click", () => {
  modal.style.display = "none";
});

// 이벤트 위임
document
  .querySelector(".movie-container")
  .addEventListener("click", (event) => {
    const cardBox = event.target.closest(".card-box");
    if (cardBox) {
      const movieId = cardBox.getAttribute("data-id");
      fetchMovieDetails(movieId);
    }
  });

// 영화 세부정보 받아오고 모달로 띄워주기
function fetchMovieDetails(movieId) {
  const url = `https://api.themoviedb.org/3/movie/${movieId}?language=ko-KR`;

  fetch(url, options)
    .then((response) => response.json())
    .then((movie) => {
      updateModal(movie);
      modal.style.display = "block";
    })
    .catch((err) => {
      console.error("에러 발생: ", err);
    });
}

// 모달 페이지 생성함수
function updateModal(movie) {
  currentMovie = movie;
  document.querySelector(".modal-title").textContent = movie.title;
  document.querySelector(".modal-info").textContent = movie.overview;
  document.querySelector(
    ".modal-date"
  ).textContent = `개봉일: ${movie.release_date}`;
  document.querySelector(
    ".modal-rate"
  ).textContent = `평점: ${movie.vote_average}`;
  document.querySelector(
    ".modal-image-element"
  ).src = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
  document.querySelector(
    ".modal-image-element"
  ).alt = `${movie.title} 포스터 이미지`;

  // 모달 내 북마크 버튼 + 영화 id 연결
  const bookmarkBtn = document.querySelector(".bookmark-btn");
  bookmarkBtn.dataset.id = movie.id;

  updateBookmarkButton(movie.id);
}

// --------------------------------------------------

// 북마크 로컬스토리지 저장/제거
function addBookmark(movieId, movieData) {
  let bookmarks = JSON.parse(localStorage.getItem("bookmarks")) || [];

  const exists = bookmarks.find(
    (bookmark) => bookmark.id.toString() === movieId // toString()붙여서 제거 안되는 문제 해결
  );

  if (!exists) {
    bookmarks.push(movieData);
    localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
  } else {
    bookmarks = bookmarks.filter(
      (bookmark) => bookmark.id.toString() !== movieId
    );
    localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
  }

  updateBookmarkButton(movieId);
}

// 북마크 버튼 문구 관리
function updateBookmarkButton(movieId) {
  const bookmarks = JSON.parse(localStorage.getItem("bookmarks")) || [];
  const isBookmarked = bookmarks.some((bookmark) => bookmark.id === movieId);
  const bookmarkBtn = document.querySelector(".bookmark-btn");

  if (isBookmarked) {
    bookmarkBtn.textContent = "북마크 제거";
  } else {
    bookmarkBtn.textContent = "북마크 추가";
  }
}

// 모달에서 북마크 버튼 클릭 감지
document.querySelector(".modal-popup").addEventListener("click", (event) => {
  const bookmarkBtn = event.target.closest(".bookmark-btn");
  if (bookmarkBtn) {
    const movieId = bookmarkBtn.dataset.id; //여기서 movieid가 문자열로 받아와짐
    if (currentMovie && currentMovie.id.toString() === movieId) {
      // 이해안됨
      addBookmark(movieId, {
        id: currentMovie.id,
        title: currentMovie.title,
        release_date: currentMovie.release_date,
        vote_average: currentMovie.vote_average,
        poster_path: currentMovie.poster_path,
        overview: currentMovie.overview,
      });
    }
  }
});

// 메인페이지 북마크 보기 / 돌아가기 버튼
bookmarkBtn.addEventListener("click", () => {
  const bookmarks = JSON.parse(localStorage.getItem("bookmarks")) || [];

  if (bookmarkBtn.textContent === "북마크 보기") {
    showBookmarks(bookmarks);
    bookmarkBtn.textContent = "돌아가기";
  } else {
    displayMovies(movies);
    bookmarkBtn.textContent = "북마크 보기";
  }
});

function showBookmarks(bookmarks) {
  movieContainer.innerHTML = "";

  if (bookmarks.length === 0) {
    movieContainer.innerHTML = "<p>북마크된 영화가 없습니다.</p>";
    return;
  }

  bookmarks.forEach((bookmark) => {
    const movieCard = document.createElement("div"); // dom 생성
    movieCard.className = "card-box";
    movieCard.dataset.id = bookmark.id;
    movieCard.innerHTML = `   
      <div class="card-image-box">
        <img class="movie-image" 
        src="https://image.tmdb.org/t/p/w500${bookmark.poster_path}" 
        alt="${bookmark.title} 포스터 이미지"/>
      </div>
      <div class="card-text-box">
        <h4 class="movie-title">${bookmark.title}</h4>
        <p class="movie-rating">평점: ${bookmark.vote_average}</p>
      </div>
    `;
    movieContainer.appendChild(movieCard); // movieContainer.innerHTML += tempHtml; 대신 시도 -> dom 관련해서 공부

    movieCard.addEventListener("click", () => {
      fetchMovieDetails(bookmark.id);
    });
  });
}
