import { useEffect, useState, useRef} from 'react';
import './App.css';

const stories = [
  {
    title: 'React',
    url: 'https://reactjs.org/',
    author: 'Jordan Walke',
    num_comments: 3,
    points: 4,
    objectID: 0,
  },
  {
    title: 'Redux',
    url: 'https://redux.js.org/',
    author: 'Dan Abramov, Andrew Clark',
    num_comments: 2,
    points: 5,
    objectID: 1,
  }
];


const useSemiPersistentState = (key, initialState) => {
  const [value, setValue] = useState(localStorage.getItem(key) || initialState);

    /*
    this useEffect is used to trigger the side-effect
    each time the searchTerm changes
    
    useEffect params:
      - function that runs side-effect
      - dependency array of variables
    
    important notes: 
      - leaving out dependencies would make function
          run on every render of component
      - [] the function for side-effect is only called once
    */

  useEffect(() => {
    localStorage.setItem(key, value);
  }, [value, key]);

  return [value, setValue];
}


const App = () => {

  const [searchTerm, setSearchTerm] = useSemiPersistentState('search', 'React');

  
  const handleSearch = (event) => {
    setSearchTerm(event.target.value);

    localStorage.setItem('search', event.target.value);
  };

  const searchedStories = stories.filter((story) => 
    story.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

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

      <List list={searchedStories}/>

    </div>
  );
}

const List = ({list}) => {
  return (
    <ul>
      {list.map((item) => (
        <Item key={item.objectID} item={item} />
      ))}
    </ul>
  );
}

const Item = ({item}) => (
  <li>
    <span>
      <a href={item.url}>{item.title}</a>
    </span>
    <span>{item.author}</span>
    <span>{item.num_comments}</span>
    <span>{item.points}</span>
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
