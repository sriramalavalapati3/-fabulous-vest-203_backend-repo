const jwt = require("jsonwebtoken")
require('dotenv').config()
const { client } = require("../redis/redis")
const authentication = async (req, res, next) => {
	const token = req.headers.authorization;
	try {
		if (token) {
			const blacklist = await client.get(`blacklist`)
			if (blacklist == token) {
				return res.send("login again plz")
			}
			var decoded = jwt.verify(token, process.env.jwtnormalToken)
			req.userID = decoded.userID
			next()

		} else {
			res.send("User Not Authorized")
		}
	} catch (err) {

		res.send(err.message)
	}
}
module.exports = {
	authentication
}