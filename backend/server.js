
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const userSchema = new mongoose.Schema({
  f_name: { type: String, required: true },
  l_name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const User = mongoose.model("User", userSchema);

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  status: {
    type: String,
    required: true,
    enum: ["Planning", "Active", "Completed"],
  },
  project_lead_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

const Project = mongoose.model("Project", projectSchema);

const membershipSchema = new mongoose.Schema({
  project_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: true,
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

membershipSchema.index(
  { project_id: 1, user_id: 1 },
  { unique: true }
);

const ProjectMembership = mongoose.model(
  "ProjectMembership",
  membershipSchema
);

const userStorySchema = new mongoose.Schema({
  project_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  priority: {
    type: String,
    required: true,
    enum: ["High", "Medium", "Low"],
  },
  status: {
    type: String,
    required: true,
    enum: ["To Do", "In Progress", "Done"],
    default: "To Do",
  },
  assigned_user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
});

const UserStory = mongoose.model("UserStory", userStorySchema);

const validId = (id) => mongoose.isValidObjectId(id);
const storyPriorities = ["High", "Medium", "Low"];
const storyStatuses = ["To Do", "In Progress", "Done"];

const fail = (res, error) => {
  console.error(error);
  return res.status(500).json({
    message: "Database or server error.",
  });
};

const validStoryAssignment = async (projectId, userId) => {
  if (userId === null) return true;

  if (typeof userId !== "string" || !validId(userId)) {
    return false;
  }

  const userExists = await User.exists({ _id: userId });

  if (!userExists) return false;

  const membershipExists = await ProjectMembership.exists({
    project_id: projectId,
    user_id: userId,
  });

  return Boolean(membershipExists);
};

app.get("/", (req, res) => {
  res.json({ message: "Server is running" });
});

app.post("/signup", async (req, res) => {
  try {
    const { f_name, l_name, username, password } = req.body;

    if (
      ![f_name, l_name, username, password].every(
        (value) => typeof value === "string" && value.trim()
      )
    ) {
      return res.status(400).json({
        message: "All fields are required.",
      });
    }

    const existingUser = await User.findOne({ username });

    if (existingUser) {
      return res.status(409).json({
        message: "Username already exists.",
      });
    }

    await User.create({
      f_name: f_name.trim(),
      l_name: l_name.trim(),
      username: username.trim(),
      password,
    });

    res.status(201).json({
      message: "Account created successfully!",
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Username already exists.",
      });
    }

    fail(res, error);
  }
});

app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        message: "Username and password are required.",
      });
    }

    const user = await User.findOne({ username });

    if (!user || user.password !== password) {
      return res.status(401).json({
        message: "Invalid username or password.",
      });
    }

    res.json({
      message: "Login successful!",
    });
  } catch (error) {
    fail(res, error);
  }
});

app.get("/users", async (req, res) => {
  try {
    const users = await User.find()
      .select("f_name l_name username")
      .sort({ username: 1 });

    res.json(users);
  } catch (error) {
    fail(res, error);
  }
});

app.post("/projects", async (req, res) => {
  try {
    const { name, description, status, project_lead_id } = req.body;

    if (
      ![name, description, status, project_lead_id].every(
        (value) => typeof value === "string" && value.trim()
      )
    ) {
      return res.status(400).json({
        message: "All project fields are required.",
      });
    }

    if (!["Planning", "Active", "Completed"].includes(status)) {
      return res.status(400).json({
        message: "Invalid project status.",
      });
    }

    if (
      !validId(project_lead_id) ||
      !(await User.exists({ _id: project_lead_id }))
    ) {
      return res.status(404).json({
        message: "Project Lead does not exist.",
      });
    }

    const project = await Project.create({
      name: name.trim(),
      description: description.trim(),
      status,
      project_lead_id,
    });

    try {
      await ProjectMembership.create({
        project_id: project._id,
        user_id: project_lead_id,
      });
    } catch (error) {
      await Project.findByIdAndDelete(project._id);
      throw error;
    }

    res.status(201).json({
      message: "Project created successfully!",
      project,
    });
  } catch (error) {
    fail(res, error);
  }
});

app.get("/projects", async (req, res) => {
  try {
    const projects = await Project.find()
      .populate("project_lead_id", "f_name l_name username")
      .sort({ _id: -1 });

    res.json(projects);
  } catch (error) {
    fail(res, error);
  }
});

app.get("/projects/:projectId/members", async (req, res) => {
  try {
    const { projectId } = req.params;

    if (!validId(projectId)) {
      return res.status(400).json({
        message: "Invalid project ID.",
      });
    }

    if (!(await Project.exists({ _id: projectId }))) {
      return res.status(404).json({
        message: "Project does not exist.",
      });
    }

    const memberships = await ProjectMembership.find({
      project_id: projectId,
    }).populate("user_id", "f_name l_name username");

    res.json(memberships);
  } catch (error) {
    fail(res, error);
  }
});

app.post("/projects/:projectId/members", async (req, res) => {
  try {
    const { projectId } = req.params;
    const { user_id } = req.body;

    if (!validId(projectId)) {
      return res.status(400).json({
        message: "Invalid project ID.",
      });
    }

    if (!(await Project.exists({ _id: projectId }))) {
      return res.status(404).json({
        message: "Project does not exist.",
      });
    }

    if (
      !validId(user_id) ||
      !(await User.exists({ _id: user_id }))
    ) {
      return res.status(404).json({
        message: "User does not exist.",
      });
    }

    const existingMembership = await ProjectMembership.exists({
      project_id: projectId,
      user_id,
    });

    if (existingMembership) {
      return res.status(409).json({
        message: "User is already a member of this project.",
      });
    }

    await ProjectMembership.create({
      project_id: projectId,
      user_id,
    });

    res.status(201).json({
      message: "Member added successfully!",
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "User is already a member of this project.",
      });
    }

    fail(res, error);
  }
});

app.delete(
  "/projects/:projectId/members/:userId",
  async (req, res) => {
    try {
      const { projectId, userId } = req.params;

      if (!validId(projectId) || !validId(userId)) {
        return res.status(400).json({
          message: "Invalid project or user ID.",
        });
      }

      const project = await Project.findById(projectId);

      if (!project) {
        return res.status(404).json({
          message: "Project does not exist.",
        });
      }

      if (!(await User.exists({ _id: userId }))) {
        return res.status(404).json({
          message: "User does not exist.",
        });
      }

      if (String(project.project_lead_id) === userId) {
        return res.status(403).json({
          message: "The Project Lead cannot be removed.",
        });
      }

      const membership = await ProjectMembership.findOne({
        project_id: projectId,
        user_id: userId,
      });

      if (!membership) {
        return res.status(404).json({
          message: "Membership does not exist.",
        });
      }

      const assignedStory = await UserStory.exists({
        project_id: projectId,
        assigned_user_id: userId,
      });

      if (assignedStory) {
        return res.status(409).json({
          message:
            "This member has assigned stories. Reassign, unassign, or delete those stories before removing the member.",
        });
      }

      await ProjectMembership.deleteOne({ _id: membership._id });

      res.json({
        message: "Member removed successfully!",
      });
    } catch (error) {
      fail(res, error);
    }
  }
);

app.get("/projects/:projectId/stories", async (req, res) => {
  try {
    const { projectId } = req.params;

    if (!validId(projectId)) {
      return res.status(400).json({
        message: "Invalid project ID.",
      });
    }

    if (!(await Project.exists({ _id: projectId }))) {
      return res.status(404).json({
        message: "Project does not exist.",
      });
    }

    const stories = await UserStory.find({
      project_id: projectId,
    })
      .populate("assigned_user_id", "f_name l_name username")
      .sort({ _id: -1 });

    res.json(stories);
  } catch (error) {
    fail(res, error);
  }
});

app.post("/projects/:projectId/stories", async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title, description, priority, assigned_user_id } = req.body;

    if (!validId(projectId)) {
      return res.status(400).json({
        message: "Invalid project ID.",
      });
    }

    if (!(await Project.exists({ _id: projectId }))) {
      return res.status(404).json({
        message: "Project does not exist.",
      });
    }

    if (
      typeof title !== "string" ||
      !title.trim() ||
      typeof description !== "string" ||
      !description.trim()
    ) {
      return res.status(400).json({
        message: "Title and description are required.",
      });
    }

    if (!storyPriorities.includes(priority)) {
      return res.status(400).json({
        message: "Priority must be High, Medium, or Low.",
      });
    }

    const assignedUser =
      assigned_user_id === undefined ||
      assigned_user_id === null ||
      assigned_user_id === ""
        ? null
        : assigned_user_id;

    if (!(await validStoryAssignment(projectId, assignedUser))) {
      return res.status(400).json({
        message: "Assigned user must be a member of this project.",
      });
    }

    const story = await UserStory.create({
      project_id: projectId,
      title: title.trim(),
      description: description.trim(),
      priority,
      status: "To Do",
      assigned_user_id: assignedUser,
    });

    const populatedStory = await UserStory.findById(story._id)
      .populate("assigned_user_id", "f_name l_name username");

    res.status(201).json(populatedStory);
  } catch (error) {
    fail(res, error);
  }
});

app.put("/projects/:projectId/stories/:storyId", async (req, res) => {
  try {
    const { projectId, storyId } = req.params;
    const {
      title,
      description,
      priority,
      status,
      assigned_user_id,
    } = req.body;

    if (!validId(projectId) || !validId(storyId)) {
      return res.status(400).json({
        message: "Invalid project or story ID.",
      });
    }

    if (!(await Project.exists({ _id: projectId }))) {
      return res.status(404).json({
        message: "Project does not exist.",
      });
    }

    const story = await UserStory.findOne({
      _id: storyId,
      project_id: projectId,
    });

    if (!story) {
      return res.status(404).json({
        message: "Story does not exist in this project.",
      });
    }

    if (
      typeof title !== "string" ||
      !title.trim() ||
      typeof description !== "string" ||
      !description.trim()
    ) {
      return res.status(400).json({
        message: "Title and description are required.",
      });
    }

    if (!storyPriorities.includes(priority)) {
      return res.status(400).json({
        message: "Invalid story priority.",
      });
    }

    if (!storyStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid story status.",
      });
    }

    const assignedUser =
      assigned_user_id === undefined ||
      assigned_user_id === null ||
      assigned_user_id === ""
        ? null
        : assigned_user_id;

    if (!(await validStoryAssignment(projectId, assignedUser))) {
      return res.status(400).json({
        message: "Assigned user must be a member of this project.",
      });
    }

    story.title = title.trim();
    story.description = description.trim();
    story.priority = priority;
    story.status = status;
    story.assigned_user_id = assignedUser;

    await story.save();

    const updatedStory = await UserStory.findById(story._id)
      .populate("assigned_user_id", "f_name l_name username");

    res.json({
      message: "Story updated successfully!",
      story: updatedStory,
    });
  } catch (error) {
    fail(res, error);
  }
});

app.delete(
  "/projects/:projectId/stories/:storyId",
  async (req, res) => {
    try {
      const { projectId, storyId } = req.params;

      if (!validId(projectId) || !validId(storyId)) {
        return res.status(400).json({
          message: "Invalid project or story ID.",
        });
      }

      if (!(await Project.exists({ _id: projectId }))) {
        return res.status(404).json({
          message: "Project does not exist.",
        });
      }

      const deletedStory = await UserStory.findOneAndDelete({
        _id: storyId,
        project_id: projectId,
      });

      if (!deletedStory) {
        return res.status(404).json({
          message: "Story does not exist in this project.",
        });
      }

      res.json({
        message: "Story deleted successfully!",
      });
    } catch (error) {
      fail(res, error);
    }
  }
);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });
