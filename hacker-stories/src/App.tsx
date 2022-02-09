import React, { useEffect, useState, useRef, useReducer, useCallback } from 'react';
import axios from 'axios';
import { ReactComponent as Check } from './check.svg';
import * as Styled from './styles';

type Story = {
  objectID: string;
  url: string;
  title: string;
  author: string;
  num_comments: number;
  points: number;
};

type Stories = Array<Story>;

type StoriesState = {
  data: Stories;
  isLoading: boolean;
  isError: boolean;
};

interface StoriesFetchInitAction {
  type: 'STORIES_FETCH_INIT';
}

interface StoriesFetchSuccessAction {
  type: 'STORIES_FETCH_SUCCESS';
  payload: Stories;
}

interface StoriesFetchFailureAction {
  type: 'STORIES_FETCH_FAILURE';
}

interface StoriesRemoveItem {
  type: 'REMOVE_STORY';
  payload: Story;
}

type StoriesAction = 
  | StoriesFetchInitAction
  | StoriesFetchSuccessAction
  | StoriesFetchFailureAction
  | StoriesRemoveItem;

const storiesReducer = (
  state: StoriesState, 
  action: StoriesAction
  ) => {
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

const useSemiPersistentState = (
  key: string, 
  initialState: string
  ): [string, (newValue: string) => void]=> {
  const [value, setValue] = useState(localStorage.getItem(key) || initialState);

  useEffect(() => {
    localStorage.setItem(key, value);
  }, [value, key]);

  return [value, setValue];
}

//1a.) used to fetch tech stories from query
const API_ENDPOINT = 'https://hn.algolia.com/api/v1/search?query=';

const App = () => {

  const [searchTerm, setSearchTerm] = useSemiPersistentState('search', 'React');

  const [url, setUrl] = useState(`${API_ENDPOINT}${searchTerm}`);

  const handleSearchInput = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSearchTerm(event.target.value);
  }

  const handleSearchSubmit = (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    setUrl(`${API_ENDPOINT}${searchTerm}`);

    event.preventDefault();
  }
  const [stories, dispatchStories] = useReducer(
    storiesReducer, 
    { data: [], isLoading: false, isError: false }
  );

  // 1b.) move all data-fetching logic into function outside of side-effect
  const handleFetchStories = useCallback(async () => { // 2b.) wrap it into a useCallback hook
    dispatchStories({ type: 'STORIES_FETCH_INIT' });

    try {
      const results = await axios.get(url);
  
      dispatchStories({
        type: 'STORIES_FETCH_SUCCESS',
        payload: results.data.hits,
      });
    }

    catch {
      dispatchStories({
        type: 'STORIES_FETCH_FAILURE',
      })
    }


  }, [url]); // 5b.) memoized function created every time dependency array changes !!!

  useEffect(() => {
    handleFetchStories(); // 3b.) useEffect runs again if dependency array changes
  }, [handleFetchStories]); // 4b.) depends on new function

  const handleRemoveStory = (item: Story) => {
    dispatchStories({
      type: 'REMOVE_STORY',
      payload: item,
    });

  };
  
  return (
    <Styled.StyledContainer>
      <Styled.StyledHeadlinePrimary>My Hacker Stories</Styled.StyledHeadlinePrimary>

      <SearchForm 
        searchTerm={searchTerm}
        onSearchInput={handleSearchInput}
        onSearchSubmit={handleSearchSubmit}
      />

      {stories.isError && <p>Something went wrong ...</p>}

      {stories.isLoading ? (
        <p>...Loading</p>
      ): (
        <List list={stories.data} onRemoveItem={handleRemoveStory}/>
      )}

    </Styled.StyledContainer>
  );
}

type SearchFormProps = {
  searchTerm: string;
  onSearchInput: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSearchSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

const SearchForm = ({ searchTerm, onSearchInput, onSearchSubmit }: SearchFormProps) => (
  <Styled.StyledSearchForm onSubmit={onSearchSubmit}>
    <InputWithLabel 
      id="search"
      isFocused
      value={searchTerm}
      onInputChange={onSearchInput}
    >
      <strong>Search: </strong>
    </InputWithLabel>

    <Styled.StyledButtonLarge
      type="submit"  
      disabled={!searchTerm} 
    >
      Submit 
    </Styled.StyledButtonLarge>
  </Styled.StyledSearchForm>
);

type ListProps = {
  list: Stories;
  onRemoveItem: (item: Story) => void;
};

const List = ({list, onRemoveItem}: ListProps) => {
  return (
    <ul>
      {list.map((item) => (
        <Item key={item.objectID} item={item} onRemoveItem={onRemoveItem} />
      ))}
    </ul>
  );
}

type ItemProps = {
  item: Story;
  onRemoveItem: (item: Story) => void;
};

const Item = ({ item, onRemoveItem }: ItemProps) => (
  <Styled.StyledItem>
    <Styled.StyledColumn  style={{width: '40%'}}>
      <a href={item.url}>{item.title}</a>
    </Styled.StyledColumn>
    <Styled.StyledColumn style={{width: '40%'}}>{item.author}</Styled.StyledColumn>
    <Styled.StyledColumn style={{width: '40%'}}>{item.num_comments}</Styled.StyledColumn>
    <Styled.StyledColumn style={{width: '40%'}}>{item.points}</Styled.StyledColumn>
    <Styled.StyledColumn style={{width: '40%'}}>
      <Styled.StyledButtonSmall 
        type="button" 
        onClick={() => onRemoveItem(item)}
      >
        <Check height="18px" width="18px" />
      </Styled.StyledButtonSmall>
    </Styled.StyledColumn>
  </Styled.StyledItem>
);

type InputWithLabelProps = {
  id: string;
  value: string;
  type?: string;
  onInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isFocused?: boolean;
  children: React.ReactNode

}

const InputWithLabel = ({ id, value, isFocused, type = 'text', onInputChange, children }: InputWithLabelProps) => {

  // 1c.) create a ref -- a ref object is a persistent value which stays
  // intact over the lifetime of a React component. It comes with a prop called current,
  // which, unlike the ref object, can be changed.
  const inputRef = useRef<HTMLInputElement>(null!);

  // 3c.) opt into React's lifecycle w/ React's useEffect hook, which focuses on
  // the input field when the component renders (or its dependencies change).
  useEffect(() => {
    if(isFocused && inputRef.current){
      // 4c.) ref is passed to the input field's ref attribute, so its current property
      // gives access to the element. This executes focus as a side-effect, but only
      // if isFocused is set and current property is existent. 
      inputRef.current.focus();
    } 
  }, [isFocused]);

  return (
    <>
      <Styled.StyledLabel htmlFor={id}>{children}</Styled.StyledLabel>
      &nbsp;
      {/* 2c.) ref is passed to the input field's JSX-reserved ref attribute 
        and the element instance is assigned to the changeable current component  */}
      <Styled.StyledInput
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

export { storiesReducer, SearchForm, InputWithLabel, List, Item };