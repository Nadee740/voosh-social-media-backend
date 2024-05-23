const User = require("../models/user")
const { Storage } = require('@google-cloud/storage');


const userSignUp = async (req, res) => {
    try {
        if (!req.body.name || !req.body.email || !req.body.password)
           return res.status(404).send({ status: "failed", msg: "Invalid request " })

        const prevUser=await User.findOne({ email: req.body.email})
        if(prevUser)
        return res.status(401).send({status: "failed", msg: "User already exists !"})
       
        const user = await User(req.body)
        const {accessToken,refreshToken} = await user.generateTokens()
        await user.save()

        res.status(200).send({
            status: "ok",
            msg: "user created",
            data: user,
            accessToken,
            refreshToken

        })
    } catch (e) {
        console.log(e.message)
        res.status(400).send({
            status: "failed",
            msg: e.message
        })
    }
}


const storage = new Storage({
    keyFilename: 'titanium-gamma-387615-e263e70fd7d8.json',
});
const bucketName = process.env.BUCKET_NAME;
const bucket = storage.bucket(bucketName);

const uploadUserProfilePicture = async (req, res) => {
    try {
        if (!req.file && !req.body.profileLink) {
            return res.status(400).send({ status: "failed", msg: "not Profile Picture Uploaded" });
        }

        if (req.file) {
            const file = req.file;
            const filename = file.originalname;
            const gcsFile = bucket.file(filename);
            const stream = gcsFile.createWriteStream({
                metadata: {
                    contentType: file.mimetype,
                },
            });
            stream.on('error', err => {
                console.error('Error uploading file to GCS:', err);
                res.status(500).send('Internal server error.');
            });
            stream.on('finish', async () => {
                const imageUrl = `https://storage.googleapis.com/${bucketName}/${filename}`;
                req.user.profileLink = imageUrl;
                await req.user.save();
                res.status(200).send({ status: "success", msg: "uploaded image" });
            });
            stream.end(file.buffer)
        }
        else {
            req.user.profileLink = req.body.profileLink;
            await req.user.save();
            res.status(200).send({ status: "success", msg: "uploaded image" });
        }




    } catch (err) {
        res.status(401).send({
            status: "failed",
            msg: err.message
        })
    }
}
const viewUserProfile = async (req, res) => {
    try {
        res.status(200).send({
            status: "success",
            msg: "got user profile",
            data: req.user
        })

    } catch (err) {
        res.status(401).send({
            status: "failed",
            msg: err.message
        })
    }
}

const editUserProfile = async (req, res) => {
    try {
        if (req.body.name)
            req.user.name = req.body.name
        if (req.body.email && !req.user.sso)
            req.user.email = req.body.email
        if (req.body.phone)
            req.user.phone = req.body.phone
        if (req.body.password)
            req.user.password = req.body.password
        if (req.body.bio) {
            req.user.bio = req.body.bio
        }
        if (req.body.public)
            req.user.public = req.body.public

        await req.user.save()

        res.status(201).send({ status: 'success', msg: "updated profile", data: req.user })
    } catch (err) {
        res.status(401).send({
            status: "failed",
            msg: err.message
        })
    }
}

const viewProfiles = async (req, res) => {
    try {
        const users = await User.find({ public: true })
        res.status(200).send({
            status: "success",
            msg: "got all users",
            data: users
        })

    } catch (err) {
        res.status(400).send({
            status: "failed",
            msg: err.message
        })
    }
}

module.exports = {
    userSignUp,
    viewUserProfile,
    editUserProfile,
    uploadUserProfilePicture,
    viewProfiles
}