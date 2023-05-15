const express = require('express');
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const { authentication } = require("../middlewares/authentication")
const { UserModel } = require("../models/userModel")
const { client } = require("../redis/redis")
const userRouter = express.Router()
require('dotenv').config()

userRouter.post("/register", async (req, res) => {

	let { email, username, password } = req.body;
	const check = await UserModel.findOne({ username })
	if (check) {
		return res.send({ "err": "User Already Register Please Login" })
	} else {
		try {
			password = await bcrypt.hash(password, 10)
			const user = new UserModel({ email, username, password })
			await user.save()
			res.send({ "msg": "Register Sucessfull" })

		} catch (err) {
			res.send({ "err": "Something went wrong with register", "error": err.message })
		}
	}
})


userRouter.post("/login", async (req, res) => {

	const { username, password } = req.body;
	try {
		if (username == "admin" && password == "admin") {
			const admin_token = jwt.sign({ "admin": "admin" }, process.env.admin_tokenKey, { expiresIn: '1hr' })
			return res.send("welcome admin")
		}
		const user = await UserModel.find({ username })
		if (user) {
			bcrypt.compare(password, user[0].password, function (err, result) {
				if (result) {

					var normal_token = jwt.sign({ userID: user[0]._id }, process.env.jwtnormalToken, { expiresIn: '1hr' })
					var refresh_token = jwt.sign({ userID: user[0]._id }, process.env.jwtrefreshToken, { expiresIn: '7d' })
					user[0].password = "***"

					res.send({ "msg": "login sucessfull", "normal_token": normal_token, "refresh_token": refresh_token, user })
				} else {
					res.send({"err":"Invalid Password"})
				}
			})
		} else {
			res.send({"err":"Invalid Username"})
		}
	} catch (err) {
		return res.send({ "err": "Something went wrong" })
	}
})



userRouter.post("/logout", async (req, res) => {
	const token = req.body
	console.log(token)
	console.log(req.body)
	if (token) {
		const token = req.headers.authorization
		await client.set(`blacklist`, `${token}`)
		res.send({msg:"Logout successfully"})
	} else {
		res.status(401).send({msg:"Unauthorized"});
	}
});

module.exports = { userRouter }

