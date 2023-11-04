import styled from "styled-components";
import Member from "./Member";
import { useEffect, useState } from "react";

const FormStyle = styled.form`
  background-color: #d9d9d9;
  color: #000;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 15px;
  input {
    width: 250px;
    background-color: #686868;
    border: none;
    padding: 5px;
    color: #fff;
    &::placeholder {
      color: #fff;
      opacity: 0.6;
    }
  }
  .header {
    margin-bottom: 20px;
  }
  .body {
    display: grid;
    justify-content: center;
    grid-template-columns: 1fr 1fr;
    margin-bottom: 20px;
    .formControl {
      // justify-self: center;
    }
  }
  .footer {
    /* display: flex;
    flex-direction: column;
    align-items: center; */
    margin-bottom: 20px;
    .memberBlock {
      display: flex;
      gap: 20px;
      button {
        padding: 15px;
        width: 250px;
        background-color: #6c6c6c;
        border: none;
        color: #fff;
      }
    }
  }
`;

const ProjectForm = () => {

  const [members, setMembers] = useState([])

  const newProject = (e) => {
    e.preventDefault()
    const projectName = e.target[0].value
    const uriRepo = e.target[1].value
    const finalDate = new Date(e.target[2].value)
    const obj = { name: projectName, repo: uriRepo, date: finalDate, members: members }
    console.log(obj);
  }

  const addMember = () => {
    const objMember = members
    objMember.push({ name: 'devadroper' })
    setMembers(objMember)
  }

  useEffect(() => {
    console.log('hola');
  }, [members])

  return (
    <FormStyle method="get" onSubmit={newProject}>
      <section className="header">
        <h2>Crear Proyecto</h2>
        <p>
          Para crear el proyecto necesitamos una serie de datos para poder
          conectar con la informacion
        </p>
      </section>
      <section className="body">
        <div className="formControl">
          <p>Nombre del Proyecto:</p>
          <input />
        </div>
        <div className="formControl">
          <p>URI del repositorio:</p>
          <input placeholder="https://github.com/Tech-Tribe-Pals/Organised" />
        </div>
        <div className="formControl">
          <p>Fecha estimada de finalización:</p>
          <input type="date" />
        </div>
      </section>
      <section className="footer">
        <h3>Participantes</h3>
        <article className="memberBlock">
          {members.length === 0 ? '' : members.map((e, i) => (
            <Member key={i} github={e.name} />
          ))}
          <button onClick={addMember}>+ Agregar participante</button>
        </article>
      </section>
      <input type="submit" value={"Crear"} />
    </FormStyle>
  );
};

export default ProjectForm;
