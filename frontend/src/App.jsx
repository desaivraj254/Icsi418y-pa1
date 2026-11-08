
import { useEffect, useState } from "react";
import "./App.css";
import Signup from "./components/Signup";
import Login from "./components/Login";
import ProjectBacklog from "./components/ProjectBacklog";

const API = "http://localhost:5000";

const fullName = (user) =>
  user
    ? `${user.f_name} ${user.l_name} (${user.username})`
    : "Unknown user";

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
  const [membersLoading, setMembersLoading] = useState(false);

  const notify = (text, isError = false) => {
    setMessage(text);
    setError(isError);
  };

  const refreshUsers = async () => {
    const data = await request("/users");
    setUsers(data);
  };

  const refreshProjects = async () => {
    const data = await request("/projects");
    setProjects(data);
  };

  const refreshMembers = async (projectId) => {
    if (!projectId) {
      setMembers([]);
      return;
    }

    const data = await request(`/projects/${projectId}/members`);
    setMembers(data);
  };

  useEffect(() => {
    Promise.all([
      refreshUsers(),
      refreshProjects(),
    ]).catch((err) => notify(err.message, true));
  }, []);

  useEffect(() => {
    setMembers([]);
    setMemberUser("");

    if (!selected) {
      setMembersLoading(false);
      return;
    }

    let active = true;
    setMembersLoading(true);

    request(`/projects/${selected}/members`)
      .then((data) => {
        if (active) {
          setMembers(data);
        }
      })
      .catch((err) => {
        if (active) {
          notify(err.message, true);
        }
      })
      .finally(() => {
        if (active) {
          setMembersLoading(false);
        }
      });

    return () => {
      active = false;
    };
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
    } catch (err) {
      notify(err.message, true);
    }
  };

  const addMember = async (event) => {
    event.preventDefault();

    if (!selected) return;

    try {
      const data = await request(`/projects/${selected}/members`, {
        method: "POST",
        body: JSON.stringify({
          user_id: memberUser,
        }),
      });

      notify(data.message);
      setMemberUser("");
      await refreshMembers(selected);
    } catch (err) {
      notify(err.message, true);
    }
  };

  const removeMember = async (userId) => {
    if (!selected) return;

    try {
      const data = await request(
        `/projects/${selected}/members/${userId}`,
        {
          method: "DELETE",
        }
      );

      notify(data.message);
      await refreshMembers(selected);
    } catch (err) {
      notify(err.message, true);
    }
  };

  const project = projects.find(
    (item) => item._id === selected
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
              .catch((err) => notify(err.message, true))
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
              onChange={(event) =>
                setForm({
                  ...form,
                  name: event.target.value,
                })
              }
            />
          </label>

          <label>
            Description
            <textarea
              required
              value={form.description}
              onChange={(event) =>
                setForm({
                  ...form,
                  description: event.target.value,
                })
              }
            />
          </label>

          <label>
            Status
            <select
              value={form.status}
              onChange={(event) =>
                setForm({
                  ...form,
                  status: event.target.value,
                })
              }
            >
              <option value="Planning">Planning</option>
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
            </select>
          </label>

          <label>
            Project Lead
            <select
              required
              value={form.project_lead_id}
              onChange={(event) =>
                setForm({
                  ...form,
                  project_lead_id: event.target.value,
                })
              }
            >
              <option value="">
                Select a registered user
              </option>

              {users.map((user) => (
                <option
                  key={user._id}
                  value={user._id}
                >
                  {fullName(user)}
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
            refreshProjects()
              .then(() => notify("Projects refreshed."))
              .catch((err) => notify(err.message, true))
          }
        >
          Refresh Projects
        </button>

        {projects.length === 0 ? (
          <p>No projects created yet.</p>
        ) : (
          <div className="project-list">
            {projects.map((item) => (
              <article
                key={item._id}
                className="project-card"
              >
                <h3>{item.name}</h3>

                <p>{item.description}</p>

                <p>
                  <strong>Status:</strong>{" "}
                  {item.status}
                </p>

                <p>
                  <strong>Project Lead:</strong>{" "}
                  {fullName(item.project_lead_id)}
                </p>

                <button
                  type="button"
                  onClick={() => setSelected(item._id)}
                >
                  Manage Members & Backlog
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
            onChange={(event) =>
              setSelected(event.target.value)
            }
          >
            <option value="">
              Choose a project
            </option>

            {projects.map((item) => (
              <option
                key={item._id}
                value={item._id}
              >
                {item.name}
              </option>
            ))}
          </select>
        </label>

        {project && (
          <>
            <p>
              <strong>Project Lead:</strong>{" "}
              {fullName(project.project_lead_id)}
            </p>

            <h3>Current Members</h3>

            {membersLoading ? (
              <p>Loading members...</p>
            ) : members.length === 0 ? (
              <p>No members found.</p>
            ) : (
              <ul>
                {members
                  .filter((membership) => membership.user_id)
                  .map((membership) => {
                    const member = membership.user_id;
                    const isLead =
                      String(member._id) ===
                      String(project.project_lead_id?._id);

                    return (
                      <li key={membership._id}>
                        {fullName(member)}{" "}

                        {isLead ? (
                          <strong>
                            (Project Lead)
                          </strong>
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              removeMember(member._id)
                            }
                          >
                            Remove
                          </button>
                        )}
                      </li>
                    );
                  })}
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
                  onChange={(event) =>
                    setMemberUser(event.target.value)
                  }
                >
                  <option value="">
                    Select user
                  </option>

                  {users.map((user) => (
                    <option
                      key={user._id}
                      value={user._id}
                    >
                      {fullName(user)}
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

      <ProjectBacklog
        projects={projects}
        selected={selected}
        members={members}
      />

      {message && (
        <p
          role="status"
          className={error ? "error" : "success"}
        >
          {message}
        </p>
      )}
    </div>
  );
}

export default App;
