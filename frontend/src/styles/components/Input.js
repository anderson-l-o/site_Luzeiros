import styled from "styled-components";

export const InputWrapper = styled.div`

  position: relative;
  margin-bottom: 16px;
`;

export const Input = styled.input`
  width: 100%;
  padding: 12px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 8px;
  outline: none;
  transition: all 0.2s ease;
  

  &:focus {
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.2);
  }
`;

export const Label = styled.label`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #000000ff;
  font-size: 16px;

  transition: all 0.2s ease;


  ${({ active }) =>
    active &&
    `
    top: -8px;
    font-size: 12px;
    color: #007bff;
    background: #fff;
    padding: 0 4px;
  `}
`;
