import styled from 'styled-components';

const StyledSearchForm = styled.form`
  padding: 10px 0 20px 0;
  display:  flex;
  align-items: baseline;
`;

const StyledButton = styled.button`
  background: transparent;
  border: 1px solid #171212;
  padding: 5px;
  cursor: pointer;
  height: 35px;
  
  border-radius: 8px;

  transition: all 0.1s ease-in;

  &:hover {
    background: #171212;
    color: #ffffff;
  }

  &:hover > svg > g {
    fill: #ffffff;
    stroke: #ffffff;
  }
`;

const StyledButtonLarge = styled(StyledButton)`
  padding: 10px;
`;

const StyledToggleButton = styled.button`
  border-radius: 5px;
`;

export { StyledSearchForm, StyledButton, StyledButtonLarge, StyledToggleButton };