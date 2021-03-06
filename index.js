const express = require('express')
const cors = require('cors')
const PORT = 3000
const app = express()
const db = require('./database')
app.use(cors())
//   Static assets
app.use('/', express.static('public'))
let status_esp = 0
let current_time = 0
let status_lamp = 0
let status_auto = 0
let low_setting  = 0
let high_setting = 0
let current_lux =0 
let state_change = false
let cnt =0
let sql_insert = 'INSERT INTO data (time,lux) VALUES (?,?)'
setInterval(()=>{
    let time = new Date()
    if(time.getHours()===0 && time.getMinutes() ==0)
    {
        db.run('DELETE FROM data',[],(err,result)=>{
            if(err){
                console.log("delete db error:",err)
                return
            }
            console.log("delete success!")
        })
    }
},60*1000)
app.get('/init',(req,res)=>{
    let result = status_lamp +","+status_auto+","+low_setting+","+high_setting
    res.send(result)
})
app.get('/data',(req,res)=>{
    let now = new Date().getTime()/1000
    if(now -current_time >10)
    {
        status_esp = 0
        status_lamp = 0
        status_auto = 0
        current_lux = 0
    }
    else
    {
        status_esp =1
    }
    // console.log("current lux:",current_lux)
    let result = ''
    if(state_change === false)
    {
        result =current_lux +","+status_esp
    }
    else
    {
        console.log("state change")
        // console.log("status_lamp:",status_lamp)
        result =  status_lamp +","+status_auto+","+low_setting+","+high_setting + ","+status_esp
        // state_change = false
        cnt++;
        if(cnt===3)
        {
            state_change = false
            cnt =0
        }
    }
    // console.log("result:",result)
    res.send(result)
})

//lamp controller
app.get('/onlamp',(req,res)=>{
    status_lamp = 1
    res.send('ok')
})
app.get('/offlamp',(req,res)=>{
    status_lamp = 0
    res.send('ok')
})

//mode controller
app.get('/onauto',(req,res)=>{
    status_auto = 1
    res.send('ok')
})
app.get('/offauto',(req,res)=>{
    status_auto = 0
    status_lamp = 0
    state_change = true
    res.send('ok')
})


//setting controller
app.get('/setting_low',(req,res)=>{
    console.log(req.query.val)
    low_setting = req.query.val
    res.send('ok')
})
app.get('/setting_high',(req,res)=>{
    console.log(req.query.val)
    high_setting = req.query.val
    res.send('ok')
})

//get status from esp
app.get('/status_esp',(req,res)=>{
    current_time = Math.floor(new Date().getTime()/1000)
    // status_esp = 1
    let result = status_lamp +","+status_auto+","+low_setting+","+high_setting
    res.send(result) 
})
app.get('/download_data',(req,res)=>{
    let query_time = req.query.val - 60*60
    // console.log(query_time)
    let sql_query = "select time,lux from data where time>=?"
    db.all(sql_query,[query_time],(err,rows)=>{
        if(err){
            res.status(400).json({"error":err.message});
            return
        }
        let newDt=[["Time","Lux value"]]
        rows.forEach(el=>{
            let _time = new Date(el.time*1000)
            let str_time = `${_time.getDate()}/${_time.getMonth()+1}/${_time.getFullYear()} ${_time.getHours()}:${_time.getMinutes()}:${_time.getSeconds()}`
            newDt.push([str_time,el.lux])
        })
        res.json({data:newDt})
    })

})
//esp controller
app.get("/lux_esp",(req,res)=>{
    // console.log("lux:",req.query.val)
    // status_esp = 1
    current_time =Math.floor(new Date().getTime()/1000)
    current_lux = req.query.val
    db.run(sql_insert,[current_time,current_lux],(err,result)=>{
        if(err){
            console.log(err)
            res.status(400).send("error add data")
            return;
        }
        res.send('ok')
    })

    // res.send("ok")
})
app.get("/init_esp",(req,res)=>{
    console.log("init from esp:",req.query.val)
    status_esp = 1
    current_time = new Date().getTime()/1000
    let data = req.query.val.split(",")
    status_lamp = parseInt(data[0])
    status_auto = parseInt(data[1])
    current_lux = parseInt(data[2])
    low_setting = parseInt(data[3])
    high_setting = parseInt(data[4])
    // console.log("status_lamp:",status_lamp)
    state_change = true
    res.send("ok")
})
app.listen(PORT,()=>{
    console.log("app is running!")
})