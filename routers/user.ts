import { Router } from 'express';
import { readFile, writeFile } from 'fs/promises';
import { resolve} from 'path';
import multer from 'multer';
import Sharp from 'sharp';

const uploads = multer({ dest: 'public/uploads' }); // file yg diupload otomatis ke folder public/upload

export default function users() {
    const router = Router();

    router
        .get('/', (req, res, next) => {
            res.json({
                id: 1,
                firstname: 'Matt',
                lastname: 'Morgan',
            });
        })
        .post('/avatar', uploads.single('avatar'), (req, res, next) => {        //upload single avatar
            if (!!req.file) {
                res.json({
                    url: `/uploads/${req.file.filename}`,
                });
            } else {
                next(new Error('No file found'));
            }
        })
        .post('/watermark', uploads.single('file'), async (req, res, next) => {
            if (!!req.file) {
                const watermark = Sharp(await readFile(req.file.path))
                .composite([      //nambah watermark
                    { input: await readFile(resolve('./images/covalence_trans.png')),
                        left: 50,       //posisi watermark
                        top: 50 }
                ]).png().toBuffer();  //ubah format jadi png

                const fileName = `watermarked-${Date.now()}.png`; //pake date now supaya namanya unik

                await writeFile(resolve(`./public/uploads/${fileName}`), await watermark);  //nyimpen file

                res.json({
                    url: `/uploads/${fileName}`,
                });     //kirim gambar yang udah dikasi watermark
            } else {
                next(new Error('No file found'));
            }
        });

    return router;
}

function generateDoc(filename: string) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Avatar</title>
    <link rel="stylesheet" href="/css/styles.css">
</head>
<body>
    <h1>My Avatar</h1>
    <img src="/uploads/${filename}" alt="" />
</body>
</html>
`;
}