const options = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization:
      "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIwNTEwNjllNjBmNzFlMjk3NWRkNTUyM2I1ZTczNzQ4NSIsIm5iZiI6MTcyOTA1ODI3Ny4wMzQ3OTgsInN1YiI6IjY3MGY0ZWYxMDQzMzFkYjRiMTEyNjg2NyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.R5AdKtVPHNTL017i66FsKELD9B3kqfMzH1UUFjOJx68",
  },
};

let movies = [];

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
    <div class="card-box">
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
