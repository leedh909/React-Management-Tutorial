const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

const data = fs.readFileSync('./database.json');
const conf = JSON.parse(data);
const mssql = require('mssql');

const multer = require('multer');
const upload =multer({dest: './upload'})

app.get('/api/customers',(req,res)=>{
    mssql.connect(conf, function(err){
        if(err) console.log(err);

        var request = new mssql.Request();
        request.query('select * from customer where isDeleted=0', function(err, result){
            if(err) console.log(err);
            // console.log("result: ",result);
            res.send(result.recordset);
        })
    })
    
});

app.use('/image',express.static('./upload'));

app.post('/api/customers', upload.single('image'), (req,res) =>{
    let sql = "INSERT INTO CUSTOMER VALUES (@image, @name, @birthday, @gender, @job, GETDATE(), 0)";
    let image = '/image/' + req.file.filename;
    let name = req.body.name;
    let birthday = req.body.birthday;
    let gender = req.body.gender;
    let job = req.body.job;
    let params = [image, name, birthday, gender, job];

    // console.log(image);
    // console.log(name);
    // console.log(birthday);
    // console.log(gender);
    // console.log(job);

    mssql.connect(conf, function(err){
        if(err) console.log(err);

        var request = new mssql.Request();
        request.input('image',mssql.VarChar, image);
        request.input('name',mssql.NVarChar, name);
        request.input('birthday',mssql.VarChar, birthday);
        request.input('gender',mssql.NVarChar, gender);
        request.input('job',mssql.NVarChar, job);
        request.query(sql, function(err, result){
            if(err) console.log(err);
            // console.log("result: ",result);
            res.send(result.recordset);
            console.log(err);
        })
    })
})

app.delete('/api/customers/:id',(req,res) =>{
    let sql = 'UPDATE CUSTOMER SET isDeleted = 1 WHERE id = @id';
    let id = [req.params.id];
    mssql.connect(conf, function(err){
        if(err) console.log(err);

        var request = new mssql.Request();
        request.input('id',mssql.Int, id);
       
        request.query(sql, function(err, result){
            if(err) console.log(err);
            // console.log("result: ",result);
            res.send(result.recordset);
            console.log(err);
        })
    })


})


app.listen(port, () => console.log(`Listening on port ${port}`));

