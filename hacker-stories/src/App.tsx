import React, { useEffect, useState, useReducer, useCallback } from 'react';
import axios from 'axios';
import { SearchForm } from './components/SearchForm';
import { List } from './components/List';
import { InputWithLabel } from './components/InputWithLabel';
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
  page: number;
  isLoading: boolean;
  isError: boolean;
};

interface StoriesFetchInitAction {
  type: 'STORIES_FETCH_INIT';
}

interface StoriesFetchSuccessAction {
  type: 'STORIES_FETCH_SUCCESS';
  payload: {
    list: Stories,
    page: number
  }
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
        data: 
          action.payload.page === 0
          ? action.payload.list
          : state.data.concat(action.payload.list),
        page: action.payload.page,
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

// used to fetch tech stories from query
// rewrote api endpoint to be series of constants
const API_BASE = 'https://hn.algolia.com/api/v1';
const API_SEARCH = '/search';
const PARAM_SEARCH = 'query=';
const PARAM_PAGE = 'page=';

// notice the ? in between
const getUrl = (searchTerm: string, page: number) => 
  `${API_BASE}${API_SEARCH}?${PARAM_SEARCH}${searchTerm}&${PARAM_PAGE}${page}`;

  /*
    X
    https://hn.algolia.com/api/v1/search?query=react
    Y
    https://hn.algolia.com/api/v1/search?query=react&page=0

    get search term extracting between ? and &,
    query parameter is directly after ? and parameters 
      like page follow it 
  */

const extractSearchTerm = (url: string) => 
  url.substring(url.lastIndexOf('?') +  1, url.lastIndexOf('&')).replace(PARAM_SEARCH, '');
  /*
    url:
      https://hn.algolia.com/api/v1/search?query=react&page=0
    url after substring:
      query=react
    url after replace:
      react
  */

const getLastSearches = (urls: Array<string>) => 
  urls
    .reduce<string[]>((result , url, index) => {
      const searchTerm = extractSearchTerm(url);

      if(index === 0) {
        return result.concat(searchTerm);
      }

      const previousSearchTerm = result[result.length - 1];

      if(searchTerm === previousSearchTerm) {
        return result;
      }
      else {
        return result.concat(searchTerm);
      }
    }, [])
    .slice(-6)
    .slice(0, -1);


//-----------------------------------------------------------------

const App = () => {

  const [searchTerm, setSearchTerm] = useSemiPersistentState('search', 'React');

  //still wraps the returned value in []
  const [urls, setUrls] = useState([getUrl(searchTerm, 0)]);

  const handleMore = () => {
    const lastUrl = urls[urls.length - 1];
    const searchTerm = extractSearchTerm(lastUrl);
    handleSearch(searchTerm, stories.page + 1);
  }
  const handleSearch = (searchTerm: string, page: number) => {
    const url = getUrl(searchTerm, page);
    setUrls(urls.concat(url));
  }
  const handleLastSearch = (searchTerm: string) => {
    setSearchTerm(searchTerm);

    handleSearch(searchTerm, 0);
  };

  const lastSearches = getLastSearches(urls);

  const handleSearchInput = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSearchTerm(event.target.value);
  }

  const handleSearchSubmit = (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    handleSearch(searchTerm, 0);

    event.preventDefault();
  }
  const [stories, dispatchStories] = useReducer(
    storiesReducer, 
    { data: [], page: 0, isLoading: false, isError: false }
  );

  // 1b.) move all data-fetching logic into function outside of side-effect
  const handleFetchStories = useCallback(async () => { // 2b.) wrap it into a useCallback hook
    dispatchStories({ type: 'STORIES_FETCH_INIT' });

    try {
      const lastUrl = urls[urls.length - 1];
      const result = await axios.get(lastUrl);
  
      dispatchStories({
        type: 'STORIES_FETCH_SUCCESS',
        payload: {
          list: result.data.hits,
          page: result.data.page,
        },
      });
    }

    catch {
      dispatchStories({
        type: 'STORIES_FETCH_FAILURE',
      })
    }


  }, [urls]); // 5b.) memoized function created every time dependency array changes !!!

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

      <LastSearches 
        lastSearches={lastSearches}
        onLastSearch={handleLastSearch}
      />

      {stories.isError && <p>Something went wrong ...</p>}

      <List list={stories.data} onRemoveItem={handleRemoveStory}/>
      
      {stories.isLoading ? (
        <p>...Loading</p>
      ): (
        <button type="button" onClick={handleMore}>
          More
        </button> 
      )}

    </Styled.StyledContainer>
  );
};

type LastSearchesProps = {
  lastSearches: Array<string>;
  onLastSearch: (searchTerm: string) => void;
}

const LastSearches = ({ lastSearches , onLastSearch }: LastSearchesProps) => (
  <>
    {lastSearches.map((searchTerm: string, index: number) => (
        <button
          key={searchTerm + index}
          type="button"
          onClick={() => onLastSearch(searchTerm)}
        >
          {searchTerm}
        </button>
    ))}
  </>
)
export default App;

export { storiesReducer, SearchForm, InputWithLabel };