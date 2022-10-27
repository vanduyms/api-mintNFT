var express = require("express");
var app = express();

const path = require("path");
const multer = require("multer");

const { unlinkSync } = require("fs");
const { response } = require("express");
const bodyParse = require("body-parser");


const { pinFileToIPFS } = require("./utils/ipfs");
const { mint, getResult } = require("./utils/interact");
const {pinJSONtoIPFS, pinFiletoIPFS} = require("./utils/pinata");

app.use(bodyParse.json());
app.use(bodyParse.urlencoded({extended: true}));

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'storage') 
    },
    filename: function (req, file, cb) {
      const filename = Date.now() + '-' + Math.round(Math.random() * 1E9) 
      cb(null, filename + '-' + file.originalname )
    }
  })
  
const upload = multer({ storage: storage })

app.listen(3001, function () {
    console.log('API is running on port 3001');
});

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
})

app.post("/post", upload.single("image"), async (req, res, next) => {
    // Lấy địa chỉ ảnh vừa tạo
    const pathImage = `./storage/${req.file.filename}`;
    const tokenURI = await pinFileToIPFS(pathImage, req.body.name, req.body.description);
    
    res.send({
        result: tokenURI,
    })

    // Xóa image vừa tạo
    unlinkSync(pathImage);

    // const responseMint = await getResult(tokenURI);

    
    // res.send({
    //     walletAddress: req.body.walletAddress,
    //     tokenURI: tokenURI,
    //     resultMint: responseMint
    // })

    // Use Pinata
    // const pathImage = __dirname + `/storage/${req.file.filename}`;

    // const responseImg = await pinFiletoIPFS(pathImage);

    // if (responseImg.success) {
    //     // Tạo metadata
    //     const metadata = new Object();
    //     metadata.image = responseImg.pinataUrl;
    //     metadata.name = req.body.name;
    //     metadata.description = req.body.description;

    //     // Upload metadata
    //     const responseMeta = await pinJSONtoIPFS(metadata);

    //     if (responseMeta.success) {
    //         // const responseMint = await getResult(responseMeta.pinataUrl);

    //         // res.send({
    //         //     walletAddress: req.body.walletAddress,
    //         //     tokenURI: tokenURI,
    //         //     resultMint: responseMint
    //         // });
    //         res.send(responseMeta);
    //     } else {
    //         res.send(responseMeta);
    // }

    // } else {
    //     res.send(responseImg);
    // }

    // // Xóa image vừa tạo
    // unlinkSync(pathImage);
})