
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

const Project = mongoose.model("Project", projectSchema);
const ProjectMembership = mongoose.model(
  "ProjectMembership",
  membershipSchema
);

const validId = (id) => mongoose.isValidObjectId(id);

const fail = (res, error) => {
  console.error(error);
  return res.status(500).json({
    message: "Database or server error.",
  });
};

app.get("/", (req, res) => {
  res.json({ message: "Server is running" });
});

app.post("/signup", async (req, res) => {
  try {
    const { f_name, l_name, username, password } = req.body;

    if (!f_name || !l_name || !username || !password) {
      return res.status(400).json({
        message: "All fields are required.",
      });
    }

    const existingUser = await User.findOne({ username });

    if (existingUser) {
      return res.status(400).json({
        message: "Username already exists.",
      });
    }

    const newUser = new User({
      f_name,
      l_name,
      username,
      password,
    });

    await newUser.save();

    res.status(201).json({
      message: "Account created successfully!",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error creating account.",
    });
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

    res.status(200).json({
      message: "Login successful!",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error logging in.",
    });
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
    const { name, description, status, project_lead_id } =
      req.body;

    if (
      ![name, description, status, project_lead_id].every(
        (v) => typeof v === "string" && v.trim()
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

    if (
      !validId(projectId) ||
      !(await Project.exists({ _id: projectId }))
    ) {
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

    if (
      !validId(projectId) ||
      !(await Project.exists({ _id: projectId }))
    ) {
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

      if (!validId(projectId)) {
        return res.status(404).json({
          message: "Project does not exist.",
        });
      }

      const project = await Project.findById(projectId);

      if (!project) {
        return res.status(404).json({
          message: "Project does not exist.",
        });
      }

      if (
        !validId(userId) ||
        !(await User.exists({ _id: userId }))
      ) {
        return res.status(404).json({
          message: "User does not exist.",
        });
      }

      if (String(project.project_lead_id) === userId) {
        return res.status(403).json({
          message: "The Project Lead cannot be removed.",
        });
      }

      const removed = await ProjectMembership.findOneAndDelete({
        project_id: projectId,
        user_id: userId,
      });

      if (!removed) {
        return res.status(404).json({
          message: "Membership does not exist.",
        });
      }

      res.json({
        message: "Member removed successfully!",
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
