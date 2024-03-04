const multer = require('multer');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads');
    },

    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    const image = {error:"Unsupported image format"}
    const imgError = JSON.stringify(image)
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif|img)$/)) {
        cb(imgError);
    } else {
        cb(null,true)
    }
}

const fileSize = {
    limits: 1024 * 1024 * 10
}

const upload = multer({
    storage,
    fileFilter,
    limits: fileSize
})


module.exports = upload
