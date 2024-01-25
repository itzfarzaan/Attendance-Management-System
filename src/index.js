const express = require("express");
const path = require("path");
const bcrypt = require("bcrypt");
const bodyParser = require("body-parser");
const { collection, collection2 } = require("./config");
const { Attendance } = require("./config");
const mongoose = require("mongoose");

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
      studentTotalAttendedClasses: studentData.totalAttendedClasses,
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

    // Log the classes to check if they are correct
    console.log("Lecturer Classes:", lecturerData.classes);

    // Fetch students based on the classes taught by the lecturer
    const studentsData = await collection.find({ class: { $in: lecturerData.classes } });

    // Log the fetched student data for debugging
    console.log("Fetched Students Data:", studentsData);

    const currentDate = new Date().toISOString().split('T')[0];

    res.render("lecturerdash", {
      lecturerFullName: lecturerData.fullName,
      lecturerClasses: lecturerData.classes,
      currentDate,
      data: { students: studentsData || [] }
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
    const { selectedClass, date, students } = req.body;


    

    // Check if the 'selectedClass' field is provided
    if (!selectedClass) {
      return res.status(400).json({ error: 'Class is required' });
    }


    await Attendance.findOneAndUpdate(
      { class: selectedClass, date },
      { $inc: { totalperiodstaken: 1 } } // Increment by 1 each time the button is clicked
    );

    // Check if an attendance record for the given class and date already exists
    const existingAttendance = await Attendance.findOne({ class: selectedClass, date });

    if (existingAttendance) {
      // If an attendance record exists, update the students field
      existingAttendance.students = students.map(student => {
        return {
          studentId: new mongoose.Types.ObjectId(student.studentId),
          isPresent: student.isPresent,
          rollNumber: student.rollNumber,
        };
      });

      // Save the updated attendance record
      await existingAttendance.save();
    } else {
      // If no attendance record exists, create a new one
      const formattedStudents = students.map(student => {
        return {
          studentId: new mongoose.Types.ObjectId(student.studentId),
          isPresent: student.isPresent,
          rollNumber: student.rollNumber,
        };
      });

      // Create a new attendance document
      const newAttendance = new Attendance({ class: selectedClass, date, students: formattedStudents });

      // Save the new attendance document
      await newAttendance.save();

      
    }

    const studentsWithAttendance = req.body.students.filter(student => student.isPresent);
    const studentsRollNumbers = studentsWithAttendance.map(student => student.rollNumber);

    await collection.updateMany(
      { username: { $in: studentsRollNumbers } },
      { $inc: { totalAttendedClasses: 1 } }
    );
    // Log a message to confirm successful submission
    console.log("Attendance submitted successfully");

    res.json({ message: 'Attendance submitted successfully' });
  } catch (error) {
    console.error('Error submitting attendance:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});








app.get("/api/getStudentsByClass/:class", async (req, res) => {
  try {
    const selectedClass = req.params.class;

    // Retrieve students based on the selected class from your database
    const students = await collection.find({ class: selectedClass });

    res.json({ students });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});











// Route to fetch day-wise attendance data with user authentication
// Route to fetch day-wise attendance data with user authentication
app.get("/api/getDayWiseAttendance/:rollNumber", async (req, res) => {
  try {
    const studentRollNumber = req.params.rollNumber;
    // Fetch all attendance records for the student with the provided roll number
    const studentAttendanceRecords = await Attendance.find({
      "students.rollNumber": studentRollNumber,
    


    });
    // Transform the data to the required format for day-wise attendance
    const dayWiseAttendanceData = studentAttendanceRecords.map((record) => {
      // Find the student's attendance entry for the provided roll number
      const studentAttendance = record.students.find(
        (student) => student.rollNumber === studentRollNumber
      );











      return {
        dayAndDate: record.date,
        totalClassesAttended: studentAttendance.isPresent ? 1 : 0,
        totalNumberOfPeriods: record.totalperiodstaken,
        attendancePercentage:
          ((studentAttendance.isPresent ? 1 : 0) /
            record.totalperiodstaken) *
          100,
      };
    });

    res.json(dayWiseAttendanceData);
  } catch (error) {
    console.error("Error fetching day-wise attendance:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

















const port = 5500;
app.listen(port, () => {
  console.log(`Server running on port: ${port}`);
})

