
import { useEffect, useState } from "react";
import "./App.css";
import Signup from "./components/Signup";
import Login from "./components/Login";

const API = "http://localhost:5000";

const fullName = (u) =>
  u ? `${u.f_name} ${u.l_name} (${u.username})` : "Unknown user";

async function request(path, options = {}) {
  const response = await fetch(`${API}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Request failed.");
  }

  return data;
}

function App() {
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selected, setSelected] = useState("");
  const [members, setMembers] = useState([]);
  const [memberUser, setMemberUser] = useState("");

  const [form, setForm] = useState({
    name: "",
    description: "",
    status: "Planning",
    project_lead_id: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);

  const notify = (text, isError = false) => {
    setMessage(text);
    setError(isError);
  };

  const refreshUsers = async () => {
    setUsers(await request("/users"));
  };

  const refreshProjects = async () => {
    setProjects(await request("/projects"));
  };

  const refreshMembers = async (id) => {
    setMembers(
      id ? await request(`/projects/${id}/members`) : []
    );
  };

  useEffect(() => {
    Promise.all([
      refreshUsers(),
      refreshProjects(),
    ]).catch((e) => notify(e.message, true));
  }, []);

  useEffect(() => {
    refreshMembers(selected).catch((e) =>
      notify(e.message, true)
    );
  }, [selected]);

  const createProject = async (event) => {
    event.preventDefault();

    try {
      const data = await request("/projects", {
        method: "POST",
        body: JSON.stringify(form),
      });

      notify(data.message);

      setForm({
        name: "",
        description: "",
        status: "Planning",
        project_lead_id: "",
      });

      await refreshProjects();
      setSelected(data.project._id);
    } catch (e) {
      notify(e.message, true);
    }
  };

  const addMember = async (event) => {
    event.preventDefault();

    try {
      const data = await request(
        `/projects/${selected}/members`,
        {
          method: "POST",
          body: JSON.stringify({
            user_id: memberUser,
          }),
        }
      );

      notify(data.message);
      await refreshMembers(selected);
    } catch (e) {
      notify(e.message, true);
    }
  };

  const removeMember = async (id) => {
    try {
      const data = await request(
        `/projects/${selected}/members/${id}`,
        {
          method: "DELETE",
        }
      );

      notify(data.message);
      await refreshMembers(selected);
    } catch (e) {
      notify(e.message, true);
    }
  };

  const project = projects.find(
    (p) => p._id === selected
  );

  return (
    <div className="app">
      <h1>ICSI 418Y - Project Management</h1>

      <div className="forms">
        <Signup />
        <Login />
      </div>

      <section className="panel">
        <h2>Create Project</h2>

        <button
          type="button"
          onClick={() =>
            refreshUsers()
              .then(() => notify("Users refreshed."))
              .catch((e) => notify(e.message, true))
          }
        >
          Refresh Registered Users
        </button>

        <form
          onSubmit={createProject}
          className="project-form"
        >
          <label>
            Project Name
            <input
              required
              value={form.name}
              onChange={(e) =>
                setForm({
                  ...form,
                  name: e.target.value,
                })
              }
            />
          </label>

          <label>
            Description
            <textarea
              required
              value={form.description}
              onChange={(e) =>
                setForm({
                  ...form,
                  description: e.target.value,
                })
              }
            />
          </label>

          <label>
            Status
            <select
              value={form.status}
              onChange={(e) =>
                setForm({
                  ...form,
                  status: e.target.value,
                })
              }
            >
              <option>Planning</option>
              <option>Active</option>
              <option>Completed</option>
            </select>
          </label>

          <label>
            Project Lead
            <select
              required
              value={form.project_lead_id}
              onChange={(e) =>
                setForm({
                  ...form,
                  project_lead_id: e.target.value,
                })
              }
            >
              <option value="">
                Select a registered user
              </option>

              {users.map((u) => (
                <option
                  key={u._id}
                  value={u._id}
                >
                  {fullName(u)}
                </option>
              ))}
            </select>
          </label>

          <button type="submit">
            Create Project
          </button>
        </form>
      </section>

      <section className="panel">
        <h2>Projects</h2>

        <button
          type="button"
          onClick={() =>
            refreshProjects().catch((e) =>
              notify(e.message, true)
            )
          }
        >
          Refresh Projects
        </button>

        {projects.length === 0 ? (
          <p>No projects created yet.</p>
        ) : (
          <div className="project-list">
            {projects.map((p) => (
              <article
                key={p._id}
                className="project-card"
              >
                <h3>{p.name}</h3>

                <p>{p.description}</p>

                <p>
                  <strong>Status:</strong>{" "}
                  {p.status}
                </p>

                <p>
                  <strong>Project Lead:</strong>{" "}
                  {fullName(p.project_lead_id)}
                </p>

                <button
                  type="button"
                  onClick={() =>
                    setSelected(p._id)
                  }
                >
                  Manage Members
                </button>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="panel">
        <h2>Project Memberships</h2>

        <label>
          Select Project
          <select
            value={selected}
            onChange={(e) =>
              setSelected(e.target.value)
            }
          >
            <option value="">
              Choose a project
            </option>

            {projects.map((p) => (
              <option
                key={p._id}
                value={p._id}
              >
                {p.name}
              </option>
            ))}
          </select>
        </label>

        {project && (
          <>
            <p>
              <strong>Project Lead:</strong>{" "}
              {fullName(
                project.project_lead_id
              )}
            </p>

            <h3>Current Members</h3>

            {members.length === 0 ? (
              <p>No members found.</p>
            ) : (
              <ul>
                {members.map((m) => (
                  <li key={m._id}>
                    {fullName(m.user_id)}{" "}

                    {String(m.user_id?._id) ===
                    String(
                      project.project_lead_id?._id
                    ) ? (
                      <strong>
                        (Project Lead)
                      </strong>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          removeMember(
                            m.user_id._id
                          )
                        }
                      >
                        Remove
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}

            <form
              onSubmit={addMember}
              className="project-form"
            >
              <label>
                Add Registered User

                <select
                  required
                  value={memberUser}
                  onChange={(e) =>
                    setMemberUser(
                      e.target.value
                    )
                  }
                >
                  <option value="">
                    Select user
                  </option>

                  {users.map((u) => (
                    <option
                      key={u._id}
                      value={u._id}
                    >
                      {fullName(u)}
                    </option>
                  ))}
                </select>
              </label>

              <button type="submit">
                Add Member
              </button>
            </form>
          </>
        )}
      </section>

      {message && (
        <p
          role="status"
          className={
            error ? "error" : "success"
          }
        >
          {message}
        </p>
      )}
    </div>
  );
}

export default App;
