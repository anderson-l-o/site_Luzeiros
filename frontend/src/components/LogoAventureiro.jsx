import Aventureiro from '../assets/logo/LogoAventureiro.png'
import styled from 'styled-components'

const LogoContainer = styled.div`
display: flex;
  font-size: 30px;
  justify-content: center; 
  gap: 16px;
`

const LogoImage = styled.img`
  margin-right:30px;
  width: 90px;
  height: 90px;
  justify-content: center; 
  gap: 16px;
`

export default function LogoAventureiro(){
return(        
        <LogoContainer>
          <LogoImage
            src={Aventureiro}
            alt='logo'            
          />          
        </LogoContainer>
    )
}

