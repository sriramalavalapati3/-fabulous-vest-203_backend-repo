
const mongoose= require("mongoose")

const userSchema= mongoose.Schema({
	email : {
		type: String,
		required: true,
	},
	username : {
		type: String,
		required: true,
		unique: true,
	},
	password : {
		type: String,
		required: true,
	}
	
})

  const UserModel=mongoose.model("User",userSchema)
  module.exports={UserModel}