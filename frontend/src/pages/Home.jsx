import "./home.css";
import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="home">
      <h1>Bienvenue</h1>
      <p>Ceci est la page d'accueil.</p>
      <Link to="/todo">Aller à la To Do List</Link>
    </div>
  );
}

export default Home;