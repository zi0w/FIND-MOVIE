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
    console.log(response.results);

    response.results.forEach((element) => {
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
      document.querySelector(".movie-container").innerHTML += tempHtml;
    });
  })
  // 에러 처리 -> 에러 발생시 콘솔에 에러 메세지 출력
  // 사용자 입장에서의 에러 처리가 필요하다(alert!)
  .catch((err) => {
    console.error("에러 발생: ", err);
    alert("에러가 발생했습니다. 다시 시도해 주세요.");
  });
