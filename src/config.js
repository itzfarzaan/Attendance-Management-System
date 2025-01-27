const mongoose = require("mongoose");
const connect = mongoose.connect(DB_STRING,{});


// check connection 
connect.then(() => {
  console.log("Database connected Successfully");
})
  .catch(() => {
    console.log("Database could not be connected");
  });

//Schema
const LoginSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  password: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  class: {
    type: String,
    required: true,
  },

  dayWiseAttendance: {
    type: [
      {
        date: {
          type: String,
          required: true,
        },
        numberOfClasses: {
          type: Number,
          default: 1,
        }
      }
    ],
    default: [] // Initialize as an empty array by default
  }
});

const TeacherLoginSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  password: {
    type: Number,
    required: true
  },
  fullName: {
    type: String,
    required: true
  },
  classes: {
    type: Array,
    required: true
  }
});

const AttendanceSchema = new mongoose.Schema({
  class: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  // Example structure for student attendance
  students: [
    {
      studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'  // Reference to the Student model
      },
      isPresent: {
        type: Boolean,
        default: false
      },
      rollNumber: {
        type: mongoose.Schema.Types.String,
        ref: 'Student.username'
      },
    }
  ],
  totalperiodstaken: {
    type: Number,
    default: 1
  },
});



//Models
const collection = new mongoose.model("Student", LoginSchema);
const collection2 = new mongoose.model("Teacher", TeacherLoginSchema);
const Attendance = new mongoose.model("Attendance", AttendanceSchema);


// Uncomment the below function to check the userdata arrays
// collection.find({})
//   .then(data => {
//     console.log(data);
//   })
//   .catch(error => {
//     console.error("Error during find:", error);
//   });



module.exports = {
  collection,
  collection2,
  Attendance
};
