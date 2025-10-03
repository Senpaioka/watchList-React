import './App.css'
import { useState, useEffect, useRef } from "react";
import StarRating from './components/StarRating';
import TextExpender from './components/TextExpender';

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);


const KEY = '433edc43';


export default function App() {
  
  const [isLoading, setIsLoading] = useState(false)
  const [movies, setMovies] = useState([]);
  const [error, setError] = useState('')
  const [query, setQuery] = useState("");
  const [selectedID, setSelectedID] = useState(null)
  
  // const [watched, setWatched] = useState([]);
  const [watched, setWatched] = useState(function() {
    const storedValue = localStorage.getItem('watched');
    return JSON.parse(storedValue);
  });

  function handleSelectMovie(id) {
    setSelectedID(selectedID => id === selectedID ? null : id)
  }

  function handleCloseMovie() {
    setSelectedID(null);
  }


  function handleAddWatched(movie){
    setWatched(watched => [...watched, movie]);

    // storage
    // localStorage.setItem('watched', JSON.stringify([...watched, movie]))
  }


  function handleDeleteWatched(id){
    setWatched(watched => watched.filter(movie => movie.imdbID !== id));
  }


  // storage 
  useEffect(function(){
    localStorage.setItem("watched", JSON.stringify(watched))
  }, [watched])



  useEffect(() => {

    const controller = new AbortController();

    async function fetchMovies() {
      try {
        setIsLoading(true)
        setError('')
        const response = await fetch(`http://www.omdbapi.com/?apikey=${KEY}&s=${query}`, {signal: controller.signal});
        if(!response.ok) throw new Error("Something Went Wrong !!")
        const data = await response.json()
        if(data.Response === 'False') throw new Error("Movie Not Found")
        setMovies(data.Search)
        setError('')
      } catch (err) {
        console.log(err.message)
        if (err.name !== "AbortError"){
          setError(err.message)
        }
      } finally {
        setIsLoading(false)
      }
    }

    if (!query.length) {
      setMovies([]);
      setError("");
      return;
    }

    handleCloseMovie();
    fetchMovies();

    // cleanup
    return function() {
      controller.abort();
    }

  }, [query])
  

  return (
    <>
      
      <NavBar>
        <NavSearch query={query} onQuery={setQuery}></NavSearch>
        <NavSearchResult movies={movies}></NavSearchResult>
      </NavBar>

      <Main>
        <MovieBox movies={movies}>
          {isLoading && <Loader></Loader>}
          {error && <ErrorMessage message={error}></ErrorMessage>}
          {!isLoading && !error && <MovieList movies={movies} onSelectMovie={handleSelectMovie}></MovieList>}
        </MovieBox>


        <MovieBox>
          {
            selectedID ? (
              <MovieDetails movieId={selectedID} onCloseDetails={handleCloseMovie} onAddWatched={handleAddWatched} watched={watched}></MovieDetails>
            ) : (
               <>
              <WatchListBox watched={watched}></WatchListBox>
              <WatchedMovieList watched={watched} onDelete={handleDeleteWatched}></WatchedMovieList>
              </>
            )
          }
        </MovieBox>
          
        
      </Main>
    </>
  );
}


function Loader() {

  return(
    <p className='loader'>Loading ...</p>
  )
}


function ErrorMessage({message}) {
  return <p className='error'><span>❌</span> {message} </p>
}


function NavBar({children}) {

  return (
    <nav className="nav-bar">
      <Logo></Logo>
      {children}
    </nav>
  )
}

function Main({children}) {

  return(
    <main className="main">
      {children}
    </main>
  )
}

function Logo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>watchList</h1>
    </div>
  )
}

function NavSearch({query, onQuery}) {

  const inputEl = useRef(null);

  useEffect(function(){
    function callback(event) {
      if (document.activeElement === inputEl.current) return;

      if(event.code === "Enter") {
        inputEl.current?.focus();
        onQuery('')
      }
    }

    document.addEventListener("keydown", callback);

    return () => document.removeEventListener("keydown", callback);
  }, [onQuery])

  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      ref={inputEl}
      value={query}
      onChange={(e) => onQuery(e.target.value)}
    />
  )
}

function NavSearchResult({movies}) {
  return(
    <p className="num-results">
      Found <strong>{movies.length}</strong> results
    </p>
  )
}


function MovieBox({children}) {

  const [isOpen1, setIsOpen1] = useState(true);
  
  return (
    <div className="box">
      <button
        className="btn-toggle"
        onClick={() => setIsOpen1((open) => !open)}
      >
        {isOpen1 ? "–" : "+"}
      </button>
      {
      isOpen1 && children
      }
    </div>
  )
}


function MovieList({movies, onSelectMovie}) {
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <li key={movie.imdbID} onClick={() => onSelectMovie(movie.imdbID)}>
          <img src={movie.Poster} alt={`${movie.Title} poster`} />
          <h3>{movie.Title}</h3>
          <div>
            <p>
              <span>🗓</span>
              <span>{movie.Year}</span>
            </p>
          </div>
        </li>
      ))}
    </ul>
  )
}


function WatchListBox({watched, children}) {

  const [isOpen2, setIsOpen2] = useState(true);

  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.Runtime));

  return (
  <div className="box">
    <button
      className="btn-toggle"
      onClick={() => setIsOpen2((open) => !open)}
    >
      {isOpen2 ? "–" : "+"}
    </button>
    {isOpen2 && (
      <>
        <div className="summary">
          <h2>Movies you watched</h2>
          <div>
            <p>
              <span>#️⃣</span>
              <span>{watched.length} movies</span>
            </p>
            <p>
              <span>⭐️</span>
              <span>{avgImdbRating.toFixed(2)}</span>
            </p>
            <p>
              <span>🌟</span>
              <span>{avgUserRating.toFixed(2)}</span>
            </p>
            <p>
              <span>⏳</span>
              <span>{avgRuntime} min</span>
            </p>
          </div>
        </div>

        {children}
      </>
    )}
  </div>
  )
}



function WatchedMovieList({watched, onDelete}) {

  return (
    <ul className="list">
      {watched.map((movie) => (
        <li key={movie.imdbID}>
          <img src={movie.Poster} alt={`${movie.Title} poster`} />
          <h3>{movie.Title}</h3>
          <div>
            <p>
              <span>⭐️</span>
              <span>{movie.imdbRating}</span>
            </p>
            <p>
              <span>🌟</span>
              <span>{movie.userRating}</span>
            </p>
            <p>
              <span>⏳</span>
              <span>{movie.Runtime} min</span>
            </p>

            <button className='btn-delete' onClick={() =>onDelete(movie.imdbID)}>X</button>
          </div>
        </li>
      ))}
    </ul>
  )
}


function MovieDetails({movieId, onCloseDetails, onAddWatched, watched}) {

  const [isLoading, setIsLoading] = useState(false)
  const [movie, setMovie] = useState({})
  const {Title, Year, Poster, Runtime, imdbRating, Plot, Released, Actors, Director, Genre} = movie;
  const [userRating, setUserRating] = useState('')
  const isWatched = watched.map(movie => movie.imdbID).includes(movieId)
  const userWatchedRating = watched.find(item => item.imdbID === movieId)?.userRating;

  function handleAdd() {
    const newWatchedMovie = {
      imdbID: movieId,
      Title,
      Year,
      Poster,
      imdbRating: Number(imdbRating),
      Runtime: Number(Runtime.split(" ").at(0)),
      userRating
    }

    onAddWatched(newWatchedMovie)
    onCloseDetails()
  }

    useEffect(function(){

    function callback(event) {
        if (event.code === 'Escape'){
        onCloseDetails()
      }
    }

    document.addEventListener('keydown', callback)

    return function() {
      document.removeEventListener('keydown', callback)
    }
  },[onCloseDetails])

  useEffect(() => {
    async function getMovieDetails() {
       setIsLoading(true)
       const response = await fetch(`http://www.omdbapi.com/?apikey=${KEY}&i=${movieId}`);
       const data = await response.json()
       setMovie(data)
       setIsLoading(false)
    }

    getMovieDetails()
  }, [movieId])


  useEffect(function(){
    if (!Title) return;
    document.title = `Movie | ${Title}`;

    return function() {
      document.title = 'watchList';
    }
  }, [Title])

  return (
    <div className="details">

      { isLoading ? <Loader></Loader> : (

      <>
      <header>
        <button className="btn-back" onClick={onCloseDetails}>&larr;</button>
        <img src={Poster} alt={`Poster of ${Title} movie`} />

        <div className="details-overview">
          <h2>{Title}</h2>
          <h3>Year: {Year}</h3>
          <p>{Released} &bull; {Runtime}</p>
          <p>{Genre}</p>
          <p><span>⭐</span>{imdbRating} IMDb rating</p>
        </div>
      </header>
      

      <section>
        <div className='rating'>
          
          { !isWatched ? 
            <>
            <StarRating maxRating={10} size={24} onSetRating={setUserRating}></StarRating>
            {
              userRating > 0 && <button className='btn-add' onClick={handleAdd}>+ Add to list</button>
            }
            </>  
            : <p>You rated this movie {userWatchedRating}⭐</p>        
          }
        </div>
        <TextExpender>{Plot}</TextExpender>
        <p>Starring {Actors}</p>
        <p>Directed by {Director}</p>
      </section>
      </>

      )}
    </div>
  )
}