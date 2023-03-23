const { PhotoDao, UserDao } = require('../infra')
    , jimp = require('jimp')
    , path = require('path')
    , fs = require('fs')
    , unlink = require('util').promisify(fs.unlink);

const api = {}

const userCanDelete = user => photo => photo.userId == user.id;

const defaultExtension = '.jpg';

api.list = async (req, res) => {
    const photos = await new PhotoDao(req.db)
        .listAll();
    res.json(photos);
}

api.listFormUser = async (req, res) => {
    const { userName } = req.params;
    const user = await new UserDao(req.db).findByName(userName);
    if(user) {
        const photos = await new PhotoDao(req.db)
            .listAllFromUser(user);
        res.json(photos);
    } else {
        res.status(404).json({ message: 'Usuário não encontrado'});
    }
}

api.add = async (req, res) => {
    const { photo } = req.body;
    photo.file = '';
    const id = await new PhotoDao(req.db)
                            .add(photo, req.user.id);
    res.json(id);
};

api.addUpload = async (req, res) => {

        const image = await jimp.read(req.file.path);

        await image
            .exifRotate()
            .cover(460, 460)
            .autocrop()
            .write(req.file.path);  
                
        const photo = req.body;
        photo.url = path.basename(req.file.path);
        await new PhotoDao(req.db)
                    .add(photo, req.user.id);
        res.status(200).end();       
};

api.findById = async (req, res) => {
    const { photoId } = req.params;
    const photo = await new PhotoDao(req.db)
                                .findById(photoId);
    if(photo) {
        res.json(photo);
    } else {
        res.status(404).json({ message: 'Foto não localizada'})
    }  
};

api.remove = async (req, res) => {
    const user = req.user;
    const { photoId } = req.params;
    const photo = new PhotoDao(req.db)
                        .findById(photoId);
    if(!photo) {
        return res.status(404).json({ message: 'Foto não localizada' });
    }
    
    if(userCanDelete(user)(photo)) {
        await dao.remove(photoId)
        res.status(200).end();
    } else {
        res.status(403).json({ message: 'Forbidden'});
    }
};

api.like = async (req, res) => {
    const { photoId } = req.params;
    const dao = new PhotoDao(req.db);
    const liked = await dao.likeById(photoId, req.user.id);
    if(liked) {
        return res.status(201).end();
    }
    return res.status(304).end();
};

module.exports = api;