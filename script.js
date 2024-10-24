const API_BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = "Bearer eyJhbGciOiJIUzI1NiJ9...";
const POSTER_BASE_URL = "https://image.tmdb.org/t/p/w500";

let movies = []; // fetch로 받은 영화 정보를 담을 전역 변수
let currentMovie = null; // 모달에 표시된 영화 정보를 저장할 전역 변수
const bookmarkBtn = document.querySelector(".header-bookmark-btn");
const movieContainer = document.querySelector(".movie-container");

const options = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: API_KEY,
  },
};

async function fetchTopRatedMovies() {
  try {
    const response = await fetch(
      `${API_BASE_URL}/movie/top_rated?language=ko-KR&page=1`
    );
    const data = await response.json();
    movies = data.results;
    displayMovies(movies);
  } catch (err) {
    console.log("에러 발생 ", err);
    alert("에러가 발생했습니다. 다시 시도해 주세요.");
  }
}
fetchTopRatedMovies();

// 영화 카드 렌더링
function displayMovies(movieList) {
  movieContainer.innerHTML = "";

  movieList.forEach((movie) => {
    const tempHtml = `
    <div class="card-box" data-id="${movie.id}">
      <div class="card-image-box">
        <img class="movie-image" 
        src=${POSTER_BASE_URL}${movie.poster_path}" 
        alt="${movie.title} 포스터 이미지"/>
      </div>
      <div class="card-text-box">
        <h4 class="movie-title">${movie.title}</h4>
        <p class="movie-rating">평점: ${movie.vote_average}</p>
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

const headerInput = document.querySelector(".header-input");
headerInput.addEventListener("input", function () {
  clearTimeout(debounceTimer);

  debounceTimer = setTimeout(() => {
    const searchInput = headerInput.value;
    filterMovies(searchInput);
  }, 500);
});

// --------------------------------------------------------------

//모달 닫기
const modal = document.querySelector(".modal");
const modalClose = document.querySelector(".closing-btn");

function closeModal() {
  modal.style.display = "none";
}

modalClose.addEventListener("click", closeModal);

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

async function fetchMovieDetails(movieId) {
  const url = `${API_BASE_URL}/movie/${movieId}?language=ko-KR`;

  try {
    const response = await fetch(url, options);
    const movie = await response.json();
    updateModal(movie);
    modal.style.display = "block";
  } catch (err) {
    console.error("에러 발생: ", err);
    alert("에러가 발생했습니다. 다시 시도해주세요.");
  }
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
  ).src = `${POSTER_BASE_URL}${movie.poster_path}`;
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

// 북마크 영화 카드 렌더링
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
        src="${POSTER_BASE_URL}${bookmark.poster_path}" 
        alt="${bookmark.title} 포스터 이미지"/>
      </div>
      <div class="card-text-box">
        <h4 class="movie-title">${bookmark.title}</h4>
        <p class="movie-rating">평점: ${bookmark.vote_average}</p>
      </div>
    `;
    movieContainer.appendChild(movieCard);

    movieContainer.addEventListener("click", (event) => {
      const cardBox = event.target.closest(".card-box");
      if (cardBox) {
        const movieId = cardBox.dataset.id;
        fetchMovieDetails(movieId);
      }
    });
  });
}
