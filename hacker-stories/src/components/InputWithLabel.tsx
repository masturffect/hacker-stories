import React, { useEffect, useRef } from 'react';
import * as Styled from '../styles';

type InputWithLabelProps = {
    id: string;
    value: string;
    type?: string;
    onInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    isFocused?: boolean;
    children: React.ReactNode
  
};
  
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

export { InputWithLabel };