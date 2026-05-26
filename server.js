const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const { createClient } = require("@supabase/supabase-js");
const path = require("path");

dotenv.config();

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

app.post("/signup", async (req, res) => {
  try {
    const { name, mobile } = req.body;

    if (!name || !mobile) {
      return res.status(400).json({
        success: false,
        message: "All fields required"
      });
    }

    if (mobile.length !== 10) {
      return res.status(400).json({
        success: false,
        message: "Mobile number must be 10 digits"
      });
    }

    const { data: existingUser } = await supabase
      .from("users")
      .select("*")
      .eq("mobile", mobile)
      .single();

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Mobile already registered"
      });
    }

    const { error } = await supabase
      .from("users")
      .insert([{ name, mobile }]);

    if (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }

    res.json({
      success: true,
      message: "Signup successful"
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server Running On Port ${PORT}`);
});
