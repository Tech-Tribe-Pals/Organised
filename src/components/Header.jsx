import { Link } from "react-router-dom";
import styled from "styled-components";

const HeaderStyle = styled.header`
  background-color: #222;
  nav {
    ul {
        padding: 10px;
        display: flex;
        justify-content: end;
        gap: 20px;
        li {
            list-style: none;
            a {
                text-decoration: none;
                color: #FFF;
            }
        }
    }
  }
`;

const Header = () => {
  const user = [];

  return (
    <HeaderStyle>
      <nav>
        {user.length != 0 ? (
          <ul>
            <li>
              <Link to={"/"}>Inicio</Link>
            </li>
            <li>
              <Link to={"/projects"}>Proyectos</Link>
            </li>
            <li>
              <Link to={"/ass"}>Nosotros?</Link>
            </li>
          </ul>
        ) : (
          ""
        )}
        <ul>
          <li>
            <Link to={"/"}>Iniciar sesion</Link>
          </li>
          <li>
            <Link to={"/projects"}>Registrarse</Link>
          </li>
        </ul>
      </nav>
    </HeaderStyle>
  );
};

export default Header;
