// router.js
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = require("./schema/user.js");
const Task = require("./schema/task.js");
const { ObjectId } = mongoose.Types;

router.get("/", (req, res) => {
  res.send("Hello from the router!");
});

router.get("/users", (req, res) => {
  User.find({})
    .then((users) => {
      res.send(users);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

router.get("/users/find", (req, res) => {
  User.find(req.query)
    .then((users) => {
      res.send(users);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

router.get("/users/tasks/:id", (req, res) => {
  Task.find({ assignedTo: req.params.id })
    .then((user) => {
      res.send(user);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

router.get("/users/:id", (req, res) => {
  User.findById(req.params.id)
    .then((user) => {
      res.send(user);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

router.post("/users", (req, res) => {
  console.log(req.body);
  if (!req.body) {
    res.status(400).send("Request body is missing");
  }
  if (!req.body.role) {
    req.body.role = "employee";
  }
  if (!req.body.name) {
    res.status(400).send("Name is missing");
  }
  const user = new User(req.body);
  user
    .save()
    .then((user) => {
      res.send(user);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

router.delete("/users/:id", (req, res) => {
  User.findByIdAndDelete(req.params.id)
    .then((user) => {
      res.send(user);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

router.post("/tasks", (req, res) => {
  if (!req.body) {
    res.status(400).send("Request body is missing");
  }
  if (!req.body.name) {
    res.status(400).send("Name is missing");
  }
  if (!req.body.description) {
    res.status(400).send("Description is missing");
  }
  if (
    !req.body.status ||
    !["pending", "working", "review", "done", "archive"].includes(
      req.body.status
    )
  ) {
    res.status(400).send("Status is missing or invalid");
  }
  const task = new Task(req.body);
  task
    .save()
    .then((task) => {
      res.send(task);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

router.get("/tasks", (req, res) => {
  const { createdAt, updatedAt, ...query } = req.query;
  const sortOptions = {};
  if (createdAt) {
    sortOptions.createdAt = -1;
  }
  if (updatedAt) {
    sortOptions.updatedAt = -1;
  }
  Task.find(query)
    .sort(sortOptions)
    .then((tasks) => {
      res.send(tasks);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

router.get("/tasks/:id", (req, res) => {
  Task.findById(req.params.id)
    .then((task) => {
      res.send(task);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

router.put("/tasks/:id", async (req, res) => {
  let { assignedTo, status } = req.body;
  if (!assignedTo) {
    assignedTo = null;
  } else {
    assignedTo = new ObjectId(assignedTo);
  }

  if (status) {
    const task = await Task.findById(req.params.id, { status }, { new: true })
      .then((task) => task)
      .catch((err) => {
        res.status(400).send(err);
      });
    if (task.status === "done" && status !== "archive") {
      res.status(400).send("Can't change task status from done to " + status);
    }
  }
  const updatedDoc = {};
  if (assignedTo) {
    updatedDoc.assignedTo = assignedTo;
  }
  if (status) {
    updatedDoc.status = status;
  }

  console.log(updatedDoc);

  Task.findByIdAndUpdate(req.params.id, updatedDoc, { new: true })
    .then((task) => {
      res.send(task);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

router.delete("/tasks/:id", async (req, res) => {
  Task.findByIdAndDelete(
    req.params.id,
    { $set: { isDeleted: true } },
    { new: true }
  )
    .then((task) => {
      res.send(task);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

module.exports = router;
