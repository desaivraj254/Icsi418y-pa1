import "./App.css";
import Signup from "./components/Signup";
import Login from "./components/Login";

function App() {
  return (
    <div className="app">
      <h1>Login and Signup Application</h1>

      <div className="forms">
        <Signup />
        <Login />
      </div>
    </div>
  );
}

export default App;