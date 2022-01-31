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

const useSemiPersistentState = (key, initialState) => {
  const [value, setValue] = useState(
    localStorage.getItem(key) || initialState
  );

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

const InputWithLabel = ({ id, label, value, isFocused, type = 'text', onInputChange, children }) => {
  /*
    
  */
  const inputRef = useRef();
  useEffect(() => {
    if(isFocused && inputRef.current){
      inputRef.current.focus();
    }
  }, [isFocused]);

  return (
    <>
      <label htmlFor={id}>{children}</label>
      &nbsp;
      <input 
        id={id}
        type={type}
        value={value}
        onChange={onInputChange}
      />
    </>
  );
}

export default App;
