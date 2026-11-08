# ICSI 418Y – Programming Assignment 4

## Project Management Application

### About My Project

For Programming Assignment 4, I continued working on my project management application from the previous assignments.

I built the frontend using React and the backend using Node.js and Express. I used MongoDB Atlas to store the information.

In my earlier assignments, I added Signup, Login, project creation, and project membership management. For PA4, I extended the application by adding user stories and a project backlog.

The main goal of this assignment was to allow users to create and manage stories for different projects.

## Features

### Signup and Login

Users can create an account by entering their first name, last name, username, and password. Registered users can log in using their credentials.

### Project Management

Users can create a project by entering its name, description, status, and selecting a Project Lead.

The available project statuses are Planning, Active, and Completed. The Project Lead is automatically added as a member when the project is created.

### Project Members

Users can add registered members to a project and remove members when needed.

A user can belong to multiple projects, but the same user cannot be added twice to one project.

The Project Lead cannot be removed. Also, a member who has assigned user stories cannot be removed until those stories are reassigned, unassigned, or deleted.

### User Stories and Project Backlog

For PA4, I added a Project Backlog section where users can create stories for a selected project.

Each story includes:

- Title and description
- Priority: High, Medium, or Low
- Status: To Do, In Progress, or Done
- Assigned member or Unassigned

Every new story starts with the status To Do.

Users can edit stories, change their statuses, update assignments, or delete stories with confirmation.

Each project has its own backlog, so switching projects displays the stories belonging to that project.

## Technologies Used

- React, JavaScript, HTML, and CSS
- Node.js and Express.js
- MongoDB Atlas and Mongoose
- Git and GitHub
- Visual Studio Code

## MongoDB Database

My application uses four collections:

**Users:** Stores registered user information.

**Projects:** Stores project names, descriptions, statuses, and Project Leads.

**ProjectMemberships:** Stores the relationships between users and projects.

**UserStories:** Stores the stories created for each project.

I used MongoDB ObjectIds to connect projects, users, memberships, and stories. A story can also be Unassigned, which means its assigned user ID is null.

## How to Run My Project

### Step 1: Clone the Repository

```bash
git clone https://github.com/desaivraj254/Icsi418y-pa1.git
cd Icsi418y-pa1
```

### Step 2: Start the Backend

Open a terminal and run:

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` folder and add:

```env
MONGO_URI=your_mongodb_atlas_connection_string
PORT=5000
```

Then start the backend:

```bash
node server.js
```

The server should connect to MongoDB and run on port 5000.

### Step 3: Start the Frontend

Open another terminal from the main project folder and run:

```bash
cd frontend
npm install
npm run dev
```

For Windows PowerShell, use `npm.cmd run dev` if the `npm` command is blocked.

Open http://localhost:5173 in the browser.

## How to Use the Application

First, create an account using Signup and log in with the registered username and password.

Next, create a project by entering the project name, description, status, and selecting a Project Lead.

After creating the project, add other registered users as project members.

To create a user story, select a project and go to the Project Backlog section. Enter the story title and description, choose its priority, and assign it to a project member or leave it Unassigned.

The description should follow the user story format:

"As a user, I want to perform an action, so that I can achieve a goal."

After creating a story, it appears in the selected project's backlog.

Users can click Edit to update the story information, priority, status, or assignment. They can also click Delete to remove the story after confirmation.

## Testing

For PA4, the required test data includes at least three registered users, two projects, and five user stories across the two projects.

The stories should include all three priorities (High, Medium, Low), all three statuses (To Do, In Progress, Done), and both assigned and unassigned stories.

The application should also be tested to make sure:

- Stories can be created, edited, and deleted.
- Switching projects displays the correct backlog.
- Stories remain saved after refreshing the browser.
- A story can only be assigned to a member of its project.
- A member with assigned stories cannot be removed.
- The Project Lead cannot be removed.
- Invalid inputs display appropriate error messages.

## What I Learned

While working on this assignment, I learned how to add new features to an existing application without changing the previous functionality.

I practiced using React components and state management to update the frontend interface. I also worked with Express API routes to create, retrieve, update, and delete information in MongoDB.

One important concept I learned was how MongoDB ObjectIds connect users, projects, and user stories.

I also learned how backend validation helps prevent invalid assignments and member removals.

Overall, this assignment helped me understand how the frontend, backend, and database work together in a full-stack application.

## GitHub Repository

https://github.com/desaivraj254/Icsi418y-pa1

## Submission

For Programming Assignment 4, the submission includes the updated GitHub repository and a 3–5 minute Zoom demonstration video through Brightspace.