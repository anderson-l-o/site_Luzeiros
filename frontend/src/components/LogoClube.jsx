import clube from '../assets/logo/LogoClube.jpeg'
import styled from 'styled-components'

const LogoContainer = styled.div`
display: flex;
  font-size: 30px;
  justify-content: center; 
`

const LogoImage = styled.img`
  margin-right:30px;
  width: 90px;
  height: 90px;
  justify-content: center; 
`

export default function LogoClube(){
return(        
        <LogoContainer>
          <LogoImage
            src={clube}
            alt='logo'            
          />          
        </LogoContainer>
    )
}