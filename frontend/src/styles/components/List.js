import styled from "styled-components";

export const List = styled.ul`
  list-style: none;
  padding: 2px;
  margin: 0;
`;

export const ListItem = styled.li`
  padding: 8px 0;
  border-bottom: 1px solid #eee;
  font-size: 15px;

  &:last-child {
    border-bottom: none;
  }
`;