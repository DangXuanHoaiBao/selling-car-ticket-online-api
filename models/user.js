const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
    fullName: {
        type: String,
        default: ''
    },
    birthDay: {
        type: String,
        default: ''
    },
    gender: {
        type: String,
        default: ''
    },
    address: {
        type: String,
        default: ''
    },
    phoneNumber: {
        type: String,
        default: ''
    },
    urlImg: {
        type: String,
        default: ''
    },
    typeAccount: {
        type: String,
        default: 'Normal'
    },
    email: String,
    password: String

}, {collection: "users"})

const updateInfo = async (email, newUser, res) => {
    const query = {'email': email};
    userModel.findOneAndUpdate(query, {'fullName': newUser.fullName, 'gender': newUser.gender,
                                    'address': newUser.address, 'phoneNumber': newUser.phoneNumber,
                                    'urlImg': newUser.urlImg, }, {upsert: true}, function(error){
            if(error){
                console.log(error);
                return res.status(400).json({error: 'Cập nhật thất bại'});
            }
            return res.status(200).json({message: 'Cập nhật thành công'})
        })
  };
  const changePassword = async (email, password, newPassword, oldPassword, res) => {
    const query = {'email': email};
    if(password !== oldPassword){
        return res.status(400).json({
            message: 'Mật khẩu cũ không chính xác'
          });
    }

    userModel.findOneAndUpdate(query, {'password': newPassword}, {upsert: true}, function(error){
            if(error){
                console.log(error);
                return res.status(400).json({error});
            }
            return res.status(200).json({message: 'Đổi mật khẩu thành công'})
        })
  };  

const userModel = mongoose.model("userModel", userSchema);
module.exports = {
    userModel,
    updateInfo, 
    changePassword
}