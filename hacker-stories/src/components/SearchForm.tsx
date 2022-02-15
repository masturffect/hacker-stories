import * as React from 'react';
import { InputWithLabel } from './InputWithLabel';
import * as Styled from '../styles';

type SearchFormProps = {
    searchTerm: string;
    onSearchInput: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onSearchSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};

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

export { SearchForm };