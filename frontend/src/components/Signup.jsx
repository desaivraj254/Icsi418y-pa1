import { useState } from "react";

function Signup() {
  const emptyForm = {
    f_name: "",
    l_name: "",
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
      const response = await fetch("http://localhost:5000/signup", {
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
      <h2>Signup</h2>

      <form onSubmit={handleSubmit}>
        <label>First Name</label>
        <input
          type="text"
          name="f_name"
          value={formData.f_name}
          onChange={handleChange}
          required
        />

        <label>Last Name</label>
        <input
          type="text"
          name="l_name"
          value={formData.l_name}
          onChange={handleChange}
          required
        />

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

        <button type="submit">Create Account</button>
      </form>

      {message && (
        <p className={success ? "success" : "error"}>{message}</p>
      )}
    </div>
  );
}

export default Signup;