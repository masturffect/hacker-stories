import { useEffect, useState, useRef, useReducer } from 'react';
import './App.css';

const storiedReducer = (state, action) => {
  switch (action.type) {
    case 'STORIES_FETCH_INIT':
      return {
        ...state,
        isLoading: true,
        isError: false,
      };
    case 'STORIES_FETCH_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.payload,
      };
    case 'STORIES_FETCH_FAILURE':
      return {
        ...state,
        isLoading: false,
        isError: true,
      }
    case 'REMOVE_STORY':
      return {
        ...state,
        data: state.data.filter(
          (story) => action.payload.objectID !== story.objectID
        ),
      };
    default:
      throw new Error();
  }
}

const useSemiPersistentState = (key, initialState) => {
  const [value, setValue] = useState(localStorage.getItem(key) || initialState);

  useEffect(() => {
    localStorage.setItem(key, value);
  }, [value, key]);

  return [value, setValue];
}

//1.) used to fetch tech stories from query
const API_ENDPOINT = 'https://hn.algolia.com/api/v1/search?query=';

const App = () => {

  const [searchTerm, setSearchTerm] = useSemiPersistentState('search', 'React');
  const [stories, dispatchStories] = useReducer(
    storiedReducer, 
    { data: [], isLoading: false, isError: false }
  );


  useEffect(() => {
    if(!searchTerm) return;

    dispatchStories({ type: 'STORIES_FETCH_INIT' });

    fetch(`${API_ENDPOINT}${searchTerm}`) // 2.) native browser's fetch API
    .then((response) => response.json()) // 3.) translated to JSON
    .then((result) => {
      dispatchStories({ 
        type: 'STORIES_FETCH_SUCCESS', 
        payload: result.hits, // 4.) returned result sent to payloud of component's state reducer 
      });
    })
    .catch(() => dispatchStories({ type: 'STORIES_FETCH_FAILURE' })
    );
  }, [searchTerm]);

  const handleRemoveStory = (item) => {
    dispatchStories({
      type: 'REMOVE_STORY',
      payload: item,
    });

  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);

    localStorage.setItem('search', event.target.value);
  };

  return (
    <div>
      <h1>My Hacker Stories</h1>

      <InputWithLabel 
        id="search"
        label="Search"
        isFocused
        value={searchTerm}
        onInputChange={handleSearch}
      >
        <strong>Search: </strong>
      </InputWithLabel>

      <hr />

      {stories.isError && <p>Something went wrong ...</p>}

      {stories.isLoading ? (
        <p>...Loading</p>
      ): (
        <List list={stories.data} onRemoveItem={handleRemoveStory}/>
      )}

    </div>
  );
}

const List = ({list, onRemoveItem}) => {
  return (
    <ul>
      {list.map((item) => (
        <Item key={item.objectID} item={item} onRemoveItem={onRemoveItem} />
      ))}
    </ul>
  );
}

const Item = ({item, onRemoveItem}) => (
  <li>
    <span>
      <a href={item.url}>{item.title}</a>
    </span>
    <span>{item.author}</span>
    <span>{item.num_comments}</span>
    <span>{item.points}</span>
    <span>
      <button type="button" onClick={() => onRemoveItem(item)}>Dismiss</button>
    </span>
  </li>
);

const InputWithLabel = ({ id, value, isFocused, type = 'text', onInputChange, children }) => {

  // 1.) create a ref -- a ref object is a persistent value which stays
  // intact over the lifetime of a React component. It comes with a prop called current,
  // which, unlike the ref object, can be changed.
  const inputRef = useRef();

  // 3.) opt into React's lifecycle w/ React's useEffect hook, which focuses on
  // the input field when the component renders (or its dependencies change).
  useEffect(() => {
    if(isFocused && inputRef.current){
      // 4.) ref is passed to the input field's ref attribute, so its current property
      // gives access to the element. This executes focus as a side-effect, but only
      // if isFocused is set and current property is existent. 
      inputRef.current.focus();
    }
  }, [isFocused]);

  return (
    <>
      <label htmlFor={id}>{children}</label>
      &nbsp;
      {/* 2.) ref is passed to the input field's JSX-reserved ref attribute 
        and the element instance is assigned to the changeable current component  */}
      <input 
        ref={inputRef}
        id={id}
        type={type}
        value={value}
        onChange={onInputChange}
      />
    </>
  );
}

export default App;
