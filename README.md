# Vraj's Project Management Application

## Author

Vraj Desai

## Course

ICSI 418Y – Software Engineering

## Assignment

Programming Assignment 3 – Projects and Project Memberships

## Application Name

Vraj's Project Management Application

## Description

Vraj's Project Management Application is a full-stack web application developed using React, Node.js, Express, and MongoDB.

The application allows users to sign up and log in, create software projects, assign project leads, and manage project memberships.

Each project contains a name, description, status, and project lead. Users can participate in multiple projects, and each project can have multiple members.

## Features

- User Signup and Login
- Create projects with a name, description, status, and project lead
- View all created projects
- Select a project to view its members
- Add registered users to projects
- Remove regular project members
- Prevent duplicate memberships
- Automatically add the project lead as a member
- Prevent removal of the project lead
- Store user and project relationships in MongoDB

## Technologies Used

- React
- JavaScript
- HTML and CSS
- Node.js
- Express.js
- MongoDB Atlas
- Mongoose

## How to Run

1. Download or clone the repository.
2. Open the project folder in Visual Studio Code.
3. Make sure Node.js is installed.
4. Open a terminal and navigate to the `backend` folder.
5. Run `npm install`.
6. Create a `.env` file in the backend folder and add your MongoDB connection string as `MONGO_URI`, along with `PORT=5000`.
7. Run `node server.js` to start the backend.
8. Open a second terminal and navigate to the `frontend` folder.
9. Run `npm install`.
10. Run `npm run dev` to start the React frontend.
11. Open `http://localhost:5173` in a web browser.
12. Use the Signup, Login, Create Project, and Project Memberships interfaces.

If PowerShell blocks npm commands, use `npm.cmd run dev`.

## MongoDB Database

The application uses three collections:

- Users
- Projects
- ProjectMemberships

The Projects collection stores project information and the Project Lead's ObjectId.

The ProjectMemberships collection stores project and user ObjectId references to represent the many-to-many relationship.

## Validation

The application checks for missing required fields, duplicate usernames, duplicate project memberships, invalid users or projects, and attempts to remove project leads.

Success and error messages are displayed to the user.

## Known Problems

There are currently no known problems with the functionality tested so far.

Changing the Project Lead after creating a project is not supported. This feature is not required for Programming Assignment 3.

## Notes

The `.env` file and `node_modules` folders should not be uploaded to GitHub.

The application extends the Signup and Login functionality from Programming Assignment 2.