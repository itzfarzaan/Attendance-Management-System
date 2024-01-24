const express = require("express");
const path = require("path");
const bcrypt = require("bcrypt");
const bodyParser = require("body-parser");
const { collection, collection2 } = require("./config");

const app = express();

// Convert data into json
app.use(express.json());

app.use(express.urlencoded({ extended: false }));

// Use EJS as the view engine
app.set("view engine", "ejs");

// static file
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.render("s_login");
});

app.get("/t_login", (req, res) => {
  res.render("t_login");
});

app.get("/s_login", (req, res) => {
  res.render("s_login");
});

// login function for students
app.post("/login", async (req, res) => {
  try {
    const check = await collection.findOne({ username: req.body.username });
    if (!check) {
      res.send("Roll Number is Invalid");
    }
    
    // comparing passwords
    const isPasswordMatch = req.body.password === check.password.toString();
 
    if (isPasswordMatch) {
      res.redirect(`/home/${req.body.username}`);
    } else {
      res.send("wrong password");
    }

  } catch {
    res.send("Wrong Details");
  }

});

app.get("/home/:rollNumber", async (req, res) => {
  try {
    // Fetch student data from the database using the rollNumber
    const studentData = await collection.findOne({ username: req.params.rollNumber });

    // Render the student dashboard template with the retrieved data
    res.render("home", {
      studentName: studentData.name,
      studentRollNumber: studentData.username,
      studentClass: studentData.class,
      // attendancePercentage: calculateAttendancePercentage(studentData.attendance),
    });
  } catch (error) {
    console.error("Error fetching student data:", error);
    res.status(500).send("Internal Server Error");
  }
});









//login function for teachers
app.post("/login2", async (req, res) => {
  try {
    const check = await collection2.findOne({ username: req.body.username });
    if (!check) {
      res.send("Username is Invalid");
    }
    
    // comparing passwords
    const isPasswordMatch = req.body.password === check.password.toString();
 
    if (isPasswordMatch) {
      res.redirect(`/lecturerdash/${req.body.username}`);
    } else {
      res.send("wrong password");
    }

  } catch {
    res.send("Wrong Details");
  }

});


app.get("/lecturerdash/:username", async (req, res) => {
  try {
    const lecturerData = await collection2.findOne({ username: req.params.username });
    const currentDate = new Date().toISOString().split('T')[0];

    res.render("lecturerdash", {
      lecturerFullName: lecturerData.fullName,
      lecturerClasses: lecturerData.classes,
      currentDate,
    });
  } catch (error) {
    console.error("Error fetching lecturer data:", error);
    res.status(500).send("Internal Server Error");
  }
});










// Route to fetch time slots based on class and date
app.get("/api/getTimeSlots/:class/:date", async (req, res) => {
  try {
    // Retrieve time slots based on class and date from your database
    // For now, a placeholder array is used
    const timeSlots = [
      { period: "Period 1" },
      { period: "Period 2" },
      // ... add more periods as needed
    ];

    res.json({ timeSlots });
  } catch (error) {
    console.error('Error fetching time slots:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Route to fetch students based on class
app.get("/api/getStudents", async (req, res) => {
  try {
    const selectedClass = req.query.class;

    // Retrieve students based on the selected class from your database
    // For now, a placeholder array is used
    const students = [
      { name: "Student 1", rollNumber: "001" },
      { name: "Student 2", rollNumber: "002" },
      // ... add more students as needed
    ];

    res.json({ students });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});





// Route to submit attendance data
app.post("/api/submitAttendance", async (req, res) => {
  try {
    const { class: selectedClass, date, timeSlots } = req.body;

    // Process and store attendance data in your database
    // For now, a placeholder response is sent
    res.json({ message: 'Attendance submitted successfully' });
  } catch (error) {
    console.error('Error submitting attendance:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});















const port = 5500;
app.listen(port, () => {
  console.log(`Server running on port: ${port}`);
})

