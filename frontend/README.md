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

Each project has its own backlog, so switching projects displays the stories belonging to that project