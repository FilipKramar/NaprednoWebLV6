let express = require("express");
let router = express.Router();
let mongoose = require("mongoose"); //mongo connection
let bodyParser = require("body-parser"); //parses information from POST
let methodOverride = require("method-override"); //used to manipulate POST

//Any requests to this controller must pass through this 'use' function
//Copy and pasted from method-override
router.use(bodyParser.urlencoded({ extended: true }));
router.use(
  methodOverride(function (req, res) {
    if (req.body && typeof req.body === "object" && "_method" in req.body) {
      // look in urlencoded POST bodies and delete it
      let method = req.body._method;
      delete req.body._method;
      return method;
    }
  })
);

//build the REST operations at the base for blobs
//this will be accessible from http://127.0.0.1:3000/projects if the default route for / is left unchanged
router
  .route("/")
  //GET all projects
  .get(async function (req, res, next) {
    try {
      //retrieve all projects from Mongo
      let projects = await mongoose.model("Project").find({});
      //respond to both HTML and JSON. JSON responses require 'Accept: application/json;' in the Request Header
      res.format({
        //HTML response will render the index.jade file in the views/projects folder. We are also setting "projects" to be an accessible variable in our jade view
        html: function () {
          res.render("projects/index", {
            title: "Projects",
            projects: projects,
          });
        },
        //JSON response will show all projects in JSON format
        json: function () {
          res.json(projects);
        },
      });
    } catch (err) {
      next(err);
    }
  })
  //POST a new project
  .post(async function (req, res) {
    try {
      // Get values from POST request. These can be done through forms or REST calls. These rely on the "name" attributes for forms
      let projectName = req.body.projectName;
      let projectDescription = req.body.projectDescription;
      let projectPrice = req.body.projectPrice;
      let projectFinishedWorks = req.body.projectFinishedWorks;
      let projectStartDate = req.body.projectStartDate;
      let projectEndDate = req.body.projectEndDate;
      let projectMembers = req.body.projectMembers;
      //call the create function for our database
      let project = await mongoose.model("Project").create({
        projectName: projectName,
        projectDescription: projectDescription,
        projectPrice: projectPrice,
        projectFinishedWorks: projectFinishedWorks,
        projectStartDate: projectStartDate,
        projectEndDate: projectEndDate,
        projectMembers: projectMembers,
      });
      //Project has been created
      console.log("POST creating new project: " + project);
      res.format({
        //HTML response will set the location and redirect back to the home page. You could also create a 'success' page if that's your thing
        html: function () {
          // If it worked, set the header so the address bar doesn't still say /adduser
          res.location("projects");
          // And forward to success page
          res.redirect("/projects");
        },
        //JSON response will show the newly created project
        json: function () {
          res.json(project);
        },
      });
    } catch (err) {
      res.send("There was a problem adding the information to the database.");
    }
  });

/* GET New Project page. */
router.get("/new", function (req, res) {
  res.render("projects/new", { title: "Add New Project" });
});

router.route("/:id").get(async function (req, res, next) {
  try {
    let project = await mongoose.model("Project").findById(req.params.id);
    res.format({
      html: function () {
        res.render("projects/show", {
          project: project,
        });
      },
      json: function () {
        res.json(project);
      },
    });
  } catch (err) {
    next(err);
  }
});

router
  .route("/edit/:id")
  //GET the individual project by Mongo ID
  .get(async function (req, res, next) {
    try {
      let project = await mongoose.model("Project").findById(req.params.id);
      //Return the project
      res.format({
        //HTML response will render the 'edit.jade' template
        html: function () {
          res.render("projects/edit", {
            title: "Project: " + project._id,
            project: project,
          });
        },
        //JSON response will return the JSON output
        json: function () {
          res.json(project);
        },
      });
    } catch (err) {
      next(err);
    }
  })
  //PUT to update a project by ID
  .put(async function (req, res) {
    try {
      // Get our REST or form values. These rely on the "name" attributes
      let projectName = req.body.projectName;
      let projectDescription = req.body.projectDescription;
      let projectPrice = req.body.projectPrice;
      let projectFinishedWorks = req.body.projectFinishedWorks;
      let projectStartDate = req.body.projectStartDate;
      let projectEndDate = req.body.projectEndDate;
      let projectMembers = req.body.projectMembers;
      //find the document by ID
      let project = await mongoose
        .model("Project")
        .findByIdAndUpdate(
          req.params.id,
          {
            projectName: projectName,
            projectDescription: projectDescription,
            projectPrice: projectPrice,
            projectFinishedWorks: projectFinishedWorks,
            projectStartDate: projectStartDate,
            projectEndDate: projectEndDate,
            projectMembers: projectMembers,
          },
          { new: true }
        );
      //HTML responds by going back to the page or you can be fancy and create a new view that shows a success page.
      res.format({
        html: function () {
          res.redirect("/projects");
        },
      });
    } catch (err) {
      res.send(
        "There was a problem updating the information to the database: " + err
      );
    }
  })
 // DELETE a Project by ID
.delete(async function (req, res) {
  try {
    // Find project by ID
    let project = await mongoose.model("Project").findById(req.params.id);
    // Remove it from MongoDB
    await project.deleteOne(); // Use deleteOne() instead of remove()
    // Returning success messages saying it was deleted
    console.log("DELETE removing ID: " + project._id);
    res.format({
      // HTML returns us back to the main page, or you can create a success page
      html: function () {
        res.redirect("/projects");
      },
      // JSON returns the item with the message that it has been deleted
      json: function () {
        res.json({
          message: "deleted",
          item: project,
        });
      },
    });
  } catch (err) {
    return console.error(err);
  }
});

module.exports = router;
