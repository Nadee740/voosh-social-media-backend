
const mongooose=require('mongoose')
const url = process.env.DB_LINK

console.log(url)
const connectionParams={
    useNewUrlParser: true,
    useUnifiedTopology: true 
}
mongooose.connect(url,connectionParams)
    .then( () => {
        console.log('Connected to the database ')
    })
    .catch( (err) => {
        console.error(`Error connecting to the database. n${err}`);
    })



    