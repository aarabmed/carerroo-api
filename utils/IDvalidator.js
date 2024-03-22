
const ObjectId = require('mongoose').Types.ObjectId;


module.exports = function (id){
    return ObjectId.isValid(id);
}