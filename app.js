const express = require("express");
const app = express();
const router = require("./routers/index");
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
dotenv.config();

app.use(
	cors({
		origin: "*",
		methods: ["GET", "POST", "DELETE", "PUT"],
		allowedHeaders: ["Content-Type", "Authorization"],
		credentials: true,
	})
);

app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/uploads", express.static("uploads"));
app.use(router);

const PORT = 8015;
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
