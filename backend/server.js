const express=require("express")
const mysql2=require("mysql2")
const cors=require("cors")
const CryptoJS=require("crypto-js")
const mysqlPromise = require('mysql2/promise'); 

const app = express()
app.use(cors())
app.use(express.json())
const pool=mysql2.createPool("mysql://root:xaVPyBfGBPpNSblrFsKcisBChSiVjFIC@roundhouse.proxy.rlwy.net:51705/railway")

const promisePool = mysqlPromise.createPool({
    connectionLimit: 10,
    host: 'roundhouse.proxy.rlwy.net',
    user: 'root',
    password: 'xaVPyBfGBPpNSblrFsKcisBChSiVjFIC',
    port: 51705,
    database: 'railway',
    waitForConnections: true,
    queueLimit: 0
});

// user content
app.post("/register/",(req,res)=>{
   const {name,email,dept,year,registerno,password,role}=req.body
    const hp = CryptoJS.SHA1(password).toString(CryptoJS.enc.Hex);
    
    pool.query("Select * from user where email=?",[email],(err,result)=>{
        if(err){
            console.log(err)
        }
        else if(result.length>0){
            res.send("exists")
        }
        else{
            pool.query("insert into user(name,email,dept,year,registerno,password,role) values(?,?,?,?,?,?,?)",[name,email,dept,year,registerno,hp,role],(err,result)=>{
                if(err){
                    console.log(err)
                }
                else{
                    res.send("ok")
                }
            })
        }
    })
})
app.post("/login/", (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    pool.query("Select * from user where email=?", email, (err, result) => {
      if (err) {
        console.log(err);
      } else if (result.length < 1) {
        res.send("NOT exists");
      } else {
        const sp = result[0].password;
        const hp = CryptoJS.SHA1(password).toString(CryptoJS.enc.Hex);
        if (sp == hp) {
          if(result[0].role==="admin"){
            res.send("admin")
          }
          else{
            res.send(result)
          }
  
        } else {
          res.send("no match");
        }
      }
    });
  });
//test assigning
app.post("/questions/spec/tech/", async (req, res) => {
  const { comp, tech, apt, verb } = req.body;
  console.log(comp,tech,apt,verb)
  let techQuery;
  let aptQuery;
  let verbQuery;
  let paramstech;
  let paramsapt;
  let paramsverb;
  
  if (comp === 'all') {
      // If comp is 'all', no restriction on company selection
      techQuery = "SELECT * FROM technical_questions ORDER BY RAND() LIMIT ?";
      aptQuery = "SELECT * FROM aptitude_questions ORDER BY RAND() LIMIT ?";
      verbQuery = "SELECT * FROM verbal_questions ORDER BY RAND() LIMIT ?";
      paramstech = [tech];
      paramsapt = [apt];
      paramsverb = [verb];
  } else {
      // Fetch questions based on the specified company
      techQuery = "SELECT * FROM technical_questions WHERE company=? ORDER BY RAND() LIMIT ?";
      aptQuery = "SELECT * FROM aptitude_questions WHERE company=? ORDER BY RAND() LIMIT ?";
      verbQuery = "SELECT * FROM verbal_questions WHERE company=? ORDER BY RAND() LIMIT ?";
      paramstech = [comp, tech];
      paramsapt = [comp, apt];
      paramsverb = [comp, verb];
  }

  try {
      const [h] = await promisePool.query(techQuery, paramstech);
      const [m] = await promisePool.query(aptQuery, paramsapt);
      const [e] = await promisePool.query(verbQuery, paramsverb);

      res.json({
          "tech": h,
          "apt": m,
          "verb": e
      });
  } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/questions/company/",(req,res)=>{
  // const {company}=req.params
  pool.query(`select distinct company from technical_questions `,(err,result)=>{
      if(err){
          console.log(err)
      }
      else{
          res.json(result)
      }
  })
})
app.get("/questions/lang/",(req,res)=>{
  // const {company}=req.params
  pool.query(`select distinct language from technical_questions `,(err,result)=>{
      if(err){
          console.log(err)
      }
      else{
          res.json(result)
      }
  })
})
app.get("/questions/aptt/",(req,res)=>{
  // const {company}=req.params
  pool.query(`select distinct topic from aptitude_questions `,(err,result)=>{
      if(err){
          console.log(err)
      }
      else{
          res.json(result)
      }
  })
})
app.get("/questions/aptc/",(req,res)=>{
  // const {company}=req.params
  pool.query(`select distinct company from aptitude_questions `,(err,result)=>{
      if(err){
          console.log(err)
      }
      else{
          res.json(result)
      }
  })
})
app.post("/questions/techm/",async(req,res)=>{
  const{pro,comp,mcq,msq,fill}=req.body
  console.log(pro, comp, mcq, msq, fill);
  let mcqQuery;
  let msqQuery;
  let fillQuery;
  let paramsmcq;
  let paramsmsq;
  let paramsfill;
  
  if (comp === 'all' && pro=="all") {
      // If comp is 'all', no restriction on company selection
      mcqQuery = "SELECT * FROM technical_questions where type=? ORDER BY RAND() LIMIT ?";
      msqQuery = "SELECT * FROM technical_questions where type=? ORDER BY RAND() LIMIT ?";
      fillQuery = "SELECT * FROM technical_questions where type=? ORDER BY RAND() LIMIT ?";
      paramsmcq = ["Multiple Select",mcq];
      paramsmsq = ["Multiple Choice",msq];
      paramsfill = ["Fill Up",fill];
  } else if(comp=="all"){
    // Fetch questions based on the specified company
    mcqQuery = "SELECT * FROM technical_questions WHERE language=? and type=? ORDER BY RAND() LIMIT ?";
    msqQuery = "SELECT * FROM technical_questions WHERE language=? and  type=? ORDER BY RAND() LIMIT ?";
    fillQuery = "SELECT * FROM technical_questions WHERE language=? and  type=?ORDER BY RAND() LIMIT ?";
    paramsmcq = [pro, "Multiple Select",mcq];
    paramsmsq = [pro,"Multiple Choice", msq];
    paramsfill = [pro,"Fill Up", fill];
}else if(pro=="all"){
  // Fetch questions based on the specified company
  mcqQuery = "SELECT * FROM technical_questions WHERE company=? and type=? ORDER BY RAND() LIMIT ?";
  msqQuery = "SELECT * FROM technical_questions WHERE company=? and  type=? ORDER BY RAND() LIMIT ?";
  fillQuery = "SELECT * FROM technical_questions WHERE company=? and  type=?ORDER BY RAND() LIMIT ?";
  paramsmcq = [comp, "Multiple Select",mcq];
  paramsmsq = [comp,"Multiple Choice", msq];
  paramsfill = [comp,"Fill Up", fill];
}
  else{
    // Fetch questions based on the specified company
    mcqQuery = "SELECT * FROM technical_questions WHERE language=?  and type=? and company=? ORDER BY RAND() LIMIT ?";
    msqQuery = "SELECT * FROM technical_questions WHERE language=? and  type=? and company=? ORDER BY RAND() LIMIT ?";
    fillQuery = "SELECT * FROM technical_questions WHERE language=? and type=? and company=? ORDER BY RAND() LIMIT ?";
    paramsmcq = [pro, "Multiple Select",comp,mcq];
    paramsmsq = [pro,"Multiple Choice",comp, msq];
    paramsfill = [pro,"Fill Up",comp, fill];
}

  try {
      const [h] = await promisePool.query(mcqQuery, paramsmcq);
      const [m] = await promisePool.query(msqQuery, paramsmsq);
      const [e] = await promisePool.query(fillQuery, paramsfill);

      res.json({
          "mcq": h,
          "msq": m,
          "fill": e
      });
  } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal Server Error" });
  }
})
app.post("/questions/aptm/",async(req,res)=>{
  const{comp,top,mcq,msq,fill}=req.body
  console.log(comp, top, mcq, msq, fill);
  let mcqQuery;
  let msqQuery;
  let fillQuery;
  let paramsmcq;
  let paramsmsq;
  let paramsfill;
  
  if (comp === 'all' && top=="all") {
      // If comp is 'all', no restriction on company selection
      mcqQuery = "SELECT * FROM aptitude_questions where type=? ORDER BY RAND() LIMIT ?";
      msqQuery = "SELECT * FROM aptitude_questions where type=? ORDER BY RAND() LIMIT ?";
      fillQuery = "SELECT * FROM aptitude_questions where type=? ORDER BY RAND() LIMIT ?";
      paramsmcq = ["Multiple Select",mcq];
      paramsmsq = ["Multiple Choice",msq];
      paramsfill = ["Fill Up",fill];
  } else if(comp=="all"){
    // Fetch questions based on the specified company
    mcqQuery = "SELECT * FROM aptitude_questions WHERE topic=? and type=? ORDER BY RAND() LIMIT ?";
    msqQuery = "SELECT * FROM aptitude_questions WHERE topic=? and  type=? ORDER BY RAND() LIMIT ?";
    fillQuery = "SELECT * FROM aptitude_questions WHERE topic=? and  type=?ORDER BY RAND() LIMIT ?";
    paramsmcq = [top, "Multiple Select",mcq];
    paramsmsq = [top,"Multiple Choice", msq];
    paramsfill = [top,"Fill Up", fill];
}else if(top=="all"){
  // Fetch questions based on the specified company
  mcqQuery = "SELECT * FROM aptitude_questions WHERE company=? and type=? ORDER BY RAND() LIMIT ?";
  msqQuery = "SELECT * FROM aptitude_questions WHERE company=? and  type=? ORDER BY RAND() LIMIT ?";
  fillQuery = "SELECT * FROM aptitude_questions WHERE company=? and  type=?ORDER BY RAND() LIMIT ?";
  paramsmcq = [comp, "Multiple Select",mcq];
  paramsmsq = [comp,"Multiple Choice", msq];
  paramsfill = [comp,"Fill Up", fill];
}
  else{
    // Fetch questions based on the specified company
    mcqQuery = "SELECT * FROM aptitude_questions WHERE topic=?  and type=? and company=? ORDER BY RAND() LIMIT ?";
    msqQuery = "SELECT * FROM aptitude_questions WHERE topic=? and  type=? and company=? ORDER BY RAND() LIMIT ?";
    fillQuery = "SELECT * FROM aptitude_questions WHERE topic=? and type=? and company=? ORDER BY RAND() LIMIT ?";
    paramsmcq = [top, "Multiple Select",comp,mcq];
    paramsmsq = [top,"Multiple Choice",comp, msq];
    paramsfill = [top,"Fill Up",comp, fill];
}

  try {
      const [h] = await promisePool.query(mcqQuery, paramsmcq);
      const [m] = await promisePool.query(msqQuery, paramsmsq);
      const [e] = await promisePool.query(fillQuery, paramsfill);

      res.json({
          "mcq": h,
          "msq": m,
          "fill": e
      });
  } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal Server Error" });
  }
})
//test schedule
app.post("/test/schedule", (req, res) => {
  const { testid, tech, apt, verb, testname, start, end, duration } = req.body;

  pool.query("select * from test_table where test_id=?", testid, (err4, result5) => {
      if (err4) {
          console.log(err4);
      } else if (result5.length > 0) {
          res.send("exist");
      } else {
          pool.query("INSERT INTO test_table(test_id, test_name, tech_q, apt_q, verb_q, duration, start_t, end_t) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", [testid, testname, JSON.stringify(tech), JSON.stringify(apt), JSON.stringify(verb), duration, start, end], (err, result) => {
              if (err) {
                  console.log(err);
                  res.send("entering err");
              } else {
                  // After successfully scheduling the test, add rows to test_activity table for all users
                  pool.query("SELECT email FROM user where role='student'", (err, users) => {
                      if (err) {
                          console.log(err);
                          res.send("error fetching users");
                      } else {
                          const usersArray = users.map(user => [user.email, testid, false, 0]); // Prepare data for bulk insert
                          pool.query("INSERT INTO test_activity(user_id, test_id, status, score) VALUES ?", [usersArray], (err, result) => {
                              if (err) {
                                  console.log(err);
                                  res.send("error adding rows to test_activity");
                              } else {
                                  // Successfully added rows to test_activity
                                  res.send("test scheduled successfully");
                              }
                          });
                      }
                  });
              }
          });
      }
  });
});
//get test
app.get("/get_test/:email", (req, res) => {
  const email = req.params.email;

  pool.query("SELECT test_id FROM test_activity WHERE user_id=? AND status=false", [email], (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send("Internal Server Error");
      return;
    }

    if (result.length < 1) {
      res.send("No test scheduled");
    } else {
      const testIds = result.map(row => row.test_id);
      
      // Retrieve details of tests from test_table using the test IDs
      pool.query("SELECT test_id,test_name,duration,start_t,end_t FROM test_table WHERE test_id IN (?)", [testIds], (err, testDetails) => {
        if (err) {
          console.log(err);
          res.status(500).send("Internal Server Error");
          return;
        }
        
        res.send(testDetails);
      });
    }
  });
});

app.listen(5000,(req,res)=>{
    console.log("connected")
})