const { User } = require("../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const Register = async (req, res) => {
	const { nama, email, password, role } = req.body;
	try {
		const hashedPassword = await bcrypt.hash(password, 10);
		const newUser = await User.create({
			nama,
			email,
			password: hashedPassword,
			role,
		});
		res
			.status(201)
			.json({ message: "User registered successfully", user: newUser });
	} catch (error) {
		res.status(500).json({ message: "Error registering user", error });
	}
};

const Login = async (req, res) => {
	const { email, password } = req.body;
	try {
		const user = await User.findOne({ where: { email } });
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		const isPasswordValid = await bcrypt.compare(password, user.password);

		if (!isPasswordValid) {
			return res.status(401).json({ message: "Invalid password" });
		}
		const token = jwt.sign(
			{ id: user.id, role: user.role, nama: user.nama },
			process.env.JWT_SECRET,
			{ expiresIn: "1h" }
		);
		res.status(200).json({ message: "Login successful", token });
	} catch (error) {
		res.status(500).json({ message: "Error logging in", error });
	}
};

module.exports = {
	Register,
	Login,
};
