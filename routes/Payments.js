// Import the required modules
const express = require("express")
const router = express.Router()

// Payment Controller
const { capturePayment, verifySignature } = require("../controllers/Payments")

// Middlewares
const { auth, isInstructor, isStudent, isAdmin } = require("../middleware/auth")

// Payments routes
router.post("/capturePayment", auth, isStudent, capturePayment)
router.post("/verifySignature", verifySignature)

module.exports = router