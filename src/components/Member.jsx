import React, { useEffect, useState } from "react";
import styled from "styled-components";

const MemberStyle = styled.div`
  background-color: #686868;
  color: #fff;
  padding: 10px;
  width: 230px;
  display: grid;
  grid-template-columns: 70px 1fr;
  align-items: center;
  justify-content: center;
  img {
    width: 70px;
    border-radius: 100%;
  }
  p {
    justify-self: center;
  }
`;

// eslint-disable-next-line react/prop-types
const Member = ({ github }) => {
  const [user, setUser] = useState([]);
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    const data = await fetch(`https://api.github.com/users/${github}`);
    const response = await data.json();
    setLoading(false)
    setUser(response);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <MemberStyle>
      {
        loading ? 'Cargando...' :
        <React.Fragment>
        <img src={user.avatar_url} alt={`${user.login} photo`} />
        <p>{user.login}</p>
        </React.Fragment>
      }
    </MemberStyle>
  );
};

export default Member;
