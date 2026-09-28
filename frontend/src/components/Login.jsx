import { useState } from "react";

function Login() {
  const emptyForm = {
    username: "",
    password: "",
  };

  const [formData, setFormData] = useState(emptyForm);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setMessage(data.message);
        setFormData(emptyForm);
      } else {
        setSuccess(false);
        setMessage(data.message);
      }
    } catch (error) {
      console.error(error);
      setSuccess(false);
      setMessage("Unable to connect to the server.");
    }
  };

  return (
    <div className="form-container">
      <h2>Login</h2>

      <form onSubmit={handleSubmit}>
        <label>Username</label>
        <input
          type="text"
          name="username"
          value={formData.username}
          onChange={handleChange}
          required
        />

        <label>Password</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <button type="submit">Login</button>
      </form>

      {message && (
        <p className={success ? "success" : "error"}>{message}</p>
      )}
    </div>
  );
}

export default Login;