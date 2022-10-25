var express = require("express");
var app = express();

const multer = require("multer");

const interact = require('./utils/interact');

var bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.listen(3306, function () {
    console.log('API is running on port 3306');
});

app.post('/mint', async (req, res) => {
    const data = {
        address: req.body.address,
        tokenURI: req.body.tokenURI,
    }

    const result = await interact.getResult(data.tokenURI);
    return res.send({
        success: true,
        address: data.address,
        result: result
    })
})
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      //files khi upload xong sẽ nằm trong thư mục "uploads" này - các bạn có thể tự định nghĩa thư mục này
      cb(null, 'storage') 
    },
    filename: function (req, file, cb) {
      // tạo tên file = thời gian hiện tại nối với số ngẫu nhiên => tên file chắc chắn không bị trùng
      const filename = Date.now() + '-' + Math.round(Math.random() * 1E9) 
      cb(null, filename + '-' + file.originalname )
    }
  })
//Khởi tạo middleware với cấu hình trên, lưu trên local của server khi dùng multer
const upload = multer({ storage: storage })

//route hiển thị form upload file
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
})

//route xử lý upload single file
// "middleware multer "upload.single('formFile')" xử lý upload single file
// ví dụ sử dụng cho upload 1 ảnh như: avatar, cover,...
/* 
    Lưu ý: upload.single('formFile') - tên của thuộc tính name trong input 
    phải giống với 'formfile" trong hàm upload.single
*/
app.post('/uploadfile', upload.single('formFile'), (req, res, next) => {
    //nhận dữ liệu từ form
    const file = req.file;
    // Kiểm tra nếu không phải dạng file thì báo lỗi
    if (!file) {
        const error = new Error('Upload file again!')
        error.httpStatusCode = 400
        return next(error)
      }

    // file đã được lưu vào thư mục uploads
    // gọi tên file: req.file.filename và render ra màn hình
    // res.sendFile(__dirname + `/storage/${req.file.filename}`);
    res.send({
        success: true,
        pathFile: __dirname + `/storage/${req.file.filename}`,
    })
})