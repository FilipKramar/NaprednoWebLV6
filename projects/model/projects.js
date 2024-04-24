let mongoose = require("mongoose");
let projectSchema = new mongoose.Schema({
  projectName: String,
  projectDescription: String,
  projectPrice: String,
  projectFinishedWorks: String,
  projectStartDate: String,
  projectEndDate: String,
  projectMembers: String,
});

mongoose.model("Project", projectSchema);