const express = require("express");
const multer = require("multer");
const path = require("path");
const router = express.Router();
const db = require("../../database");
const fs = require("fs");
const jwt = require('jsonwebtoken');

function verifyToken(req, res, next){
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if(!token){
        return res.status(401).json({
            success: false,
            message: 'Access denied. No token provided'
        });
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if(err) return res.status(403).json({
            success: false,
            message: 'Invalid token'
        });
        req.user = user;
        next();
    });
}

// Configure Storage Location & Filename
const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, "files/images");
  },
  filename: function (req, file, callback) {
    const uniqueName = "image-" + Date.now() + path.extname(file.originalname);
    callback(null, uniqueName);
  },
});

// Initialize Multer
const upload = multer({ storage: storage });

// GET - Get All Report List
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM reports");
    res.status(200).json({
      success: true,
      message: "Reports retrieved successfully.",
      data: rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Database error. Reports retrieved failed.",
      error: err.message,
    });
  }
});

// POST - Add Report
router.post("/add", upload.single("image"), verifyToken, async (req, res) => {
  const { title, date, category } = req.body;
  const imagePath = req.file ? `/files/images/${req.file.filename}` : null;
  const errors = [];

  // Validation Checks
  if (!title || title.trim() === "") {
    errors.push("Title cannot be empty.");
  }

  if (!date || date.trim() === "") {
    errors.push("Date cannot be empty.");
  }

  if (!category || category.trim() === "") {
    errors.push("Category cannot be empty.");
  }

  // Validation Failed
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed.",
      errors,
    });
  }

  try {
    // Insert New Report Into Database
    const [result] = await db.query(
      "INSERT INTO reports (title, date, category, image_path) VALUES (?, ?, ?, ?)",
      [title, date, category, imagePath]
    );

    // Success Response
    res.status(201).json({
      success: true,
      message: "Report added successfully.",
      data: {
        id: result.insertId,
        title,
        date,
        category,
        imagePath,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Database error. Failed to add report.",
      error: err.message,
    });
  }
});

// PUT - Update Report By ID
router.put("/update/:id", upload.single("image"), async (req, res) => {
  const { title, date, category } = req.body;
  const imagePath = req.file ? `/files/images/${req.file.filename}` : null;
  const reportId = req.params.id;
  const errors = [];

  // Validation Checks
  if (!title || title.trim() === "") {
    errors.push("Title cannot be empty.");
  }

  if (!date || date.trim() === "") {
    errors.push("Date cannot be empty.");
  }

  if (!category || category.trim() === "") {
    errors.push("Category cannot be empty.");
  }

  // Validation Failed
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed.",
      errors,
    });
  }

  try {
    // Update Report In Database
    let query = "UPDATE reports SET title = ?, date = ?, category = ?";
    const params = [title, date, category];

    if (imagePath) {
      query += ", image_path = ?";
      params.push(imagePath);
    }

    query += " WHERE id = ?";
    params.push(reportId);

    const [result] = await db.query(query, params);

    // Error - Not Found
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    // Success Response
    res.status(200).json({
      success: true,
      message: "Report updated successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Database error. Failed to update report.",
    });
  }
});

// DELETE - Delete Report By ID
router.delete("/delete/:id", async (req, res) => {
  try {
    const reportId = req.params.id;

    // Get Image Path First
    const [rows] = await db.query(
      "SELECT image_path FROM reports WHERE id = ?",
      [reportId]
    );

    // Error - Not Found
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }
    const imagePath = rows[0].image_path;

    // Delete Student From Database
    const [result] = await db.query("DELETE FROM reports WHERE id = ?", [
      reportId,
    ]);

    // Delete Image From Folder
    if (imagePath) {
      const fullPath = path.join(__dirname, "..", imagePath);
      fs.unlink(fullPath, (err) => {
        if (err)
          console.warn("Image file not found or already deleted:", fullPath);
      });
    }

    // Success Response
    res.status(200).json({
      success: true,
      message: "Report deleted successfully",
      data: { id: reportId },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Database error. Failed to delete report.",
      error: err.message,
    });
  }
});

// GET - Get Report Details By ID
router.get("/:id", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM reports WHERE id = ?", [
      req.params.id,
    ]);

    // Error - Not Found
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    // Success Response
    res.status(200).json({
      success: true,
      message: "Report details retrieved successfully.",
      data: rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Database error. Report details retrieved failed.",
      error: err.message,
    });
  }
});

module.exports = router;