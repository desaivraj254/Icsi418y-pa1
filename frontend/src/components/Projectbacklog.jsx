
import { useEffect, useState } from "react";

const API = "http://localhost:5000";

const emptyStory = {
  title: "",
  description: "",
  priority: "Medium",
  status: "To Do",
  assigned_user_id: "",
};

const fullName = (user) =>
  user
    ? `${user.f_name} ${user.l_name} (${user.username})`
    : "Unassigned";

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

export default function ProjectBacklog({ projects, selected, members }) {
  const [stories, setStories] = useState([]);
  const [form, setForm] = useState({ ...emptyStory });
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const project = projects.find((p) => p._id === selected);

  const notify = (text, isError = false) => {
    setMessage(text);
    setError(isError);
  };

  const refreshStories = async () => {
    if (!selected) {
      setStories([]);
      return;
    }

    try {
      const data = await request(`/projects/${selected}/stories`);
      setStories(data);
    } catch (err) {
      notify(err.message, true);
    }
  };

  useEffect(() => {
    setStories([]);
    setForm({ ...emptyStory });
    setEditingId(null);
    setMessage("");
    setLoading(Boolean(selected));

    if (!selected) return;

    let active = true;

    request(`/projects/${selected}/stories`)
      .then((data) => {
        if (active) {
          setStories(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (active) {
          notify(err.message, true);
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [selected]);

  const updateForm = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const saveStory = async (event) => {
    event.preventDefault();

    if (!selected) return;

    try {
      const path = editingId
        ? `/projects/${selected}/stories/${editingId}`
        : `/projects/${selected}/stories`;

      const payload = {
        title: form.title,
        description: form.description,
        priority: form.priority,
        assigned_user_id: form.assigned_user_id || null,
      };

      if (editingId) {
        payload.status = form.status;
      }

      await request(path, {
        method: editingId ? "PUT" : "POST",
        body: JSON.stringify(payload),
      });

      notify(
        editingId
          ? "Story updated successfully!"
          : "Story created successfully!"
      );

      setForm({ ...emptyStory });
      setEditingId(null);
      await refreshStories();
    } catch (err) {
      notify(err.message, true);
    }
  };

  const editStory = (story) => {
    setEditingId(story._id);
    setForm({
      title: story.title,
      description: story.description,
      priority: story.priority,
      status: story.status,
      assigned_user_id: story.assigned_user_id?._id || "",
    });
    setMessage("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ ...emptyStory });
    setMessage("");
  };

  const deleteStory = async (story) => {
    if (!window.confirm(`Delete "${story.title}"?`)) return;

    try {
      await request(
        `/projects/${selected}/stories/${story._id}`,
        { method: "DELETE" }
      );

      if (editingId === story._id) {
        setEditingId(null);
        setForm({ ...emptyStory });
      }

      notify("Story deleted successfully!");
      await refreshStories();
    } catch (err) {
      notify(err.message, true);
    }
  };

  return (
    <section className="panel">
      <h2>Project Backlog - User Stories</h2>

      {!project ? (
        <p>Select a project above to manage its user stories.</p>
      ) : (
        <>
          <h3>{project.name}</h3>

          <h3>{editingId ? "Edit User Story" : "Create User Story"}</h3>

          <form className="project-form" onSubmit={saveStory}>
            <label>
              Story Title
              <input
                name="title"
                value={form.title}
                onChange={updateForm}
                required
                placeholder="Enter story title"
              />
            </label>

            <label>
              Description
              <textarea
                name="description"
                value={form.description}
                onChange={updateForm}
                required
                placeholder="As a user, I want..., so that..."
              />
            </label>

            <label>
              Priority
              <select
                name="priority"
                value={form.priority}
                onChange={updateForm}
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </label>

            {editingId && (
              <label>
                Status
                <select
                  name="status"
                  value={form.status}
                  onChange={updateForm}
                >
                  <option value="To Do">To Do</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Done">Done</option>
                </select>
              </label>
            )}

            <label>
              Assigned Member
              <select
                name="assigned_user_id"
                value={form.assigned_user_id}
                onChange={updateForm}
              >
                <option value="">Unassigned</option>

                {members
                  .filter((member) => member.user_id)
                  .map((member) => (
                    <option
                      key={member.user_id._id}
                      value={member.user_id._id}
                    >
                      {fullName(member.user_id)}
                    </option>
                  ))}
              </select>
            </label>

            <button type="submit">
              {editingId ? "Save Changes" : "Create Story"}
            </button>

            {editingId && (
              <button type="button" onClick={cancelEdit}>
                Cancel
              </button>
            )}
          </form>

          <h3>Project Stories</h3>

          <button type="button" onClick={refreshStories}>
            Refresh Stories
          </button>

          {loading ? (
            <p>Loading stories...</p>
          ) : stories.length === 0 ? (
            <p>No user stories found for this project.</p>
          ) : (
            <div className="project-list">
              {stories.map((story) => (
                <article className="project-card" key={story._id}>
                  <h3>{story.title}</h3>

                  <p>{story.description}</p>

                  <p>
                    <strong>Priority:</strong> {story.priority}
                  </p>

                  <p>
                    <strong>Status:</strong> {story.status}
                  </p>

                  <p>
                    <strong>Assigned Member:</strong>{" "}
                    {fullName(story.assigned_user_id)}
                  </p>

                  <button
                    type="button"
                    onClick={() => editStory(story)}
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => deleteStory(story)}
                  >
                    Delete
                  </button>
                </article>
              ))}
            </div>
          )}
        </>
      )}

      {message && (
        <p role="status" className={error ? "error" : "success"}>
          {message}
        </p>
      )}
    </section>
  );
}
