const Joi = require("joi");

const getStudyMaterial = {
  auth: false,
  tags: ["api", "User"],
  description: "Get Study Material",
  validate: {
    query: {
      userId: Joi.number().required(),
    }
  },
  async handler(req, h) {
    try {
      let userArray = [],
        userArrayToString = '',
        conditionStatement = '';
      let userHistory = `SELECT s.smid,s.subject,u.status from studymaterial s inner join userlog u on s.smid=u.smid where u.userid=${req.query.userId}`;
      const userHistoryResult = await req.pool.query(userHistory);

      userHistoryResult.rows && userHistoryResult.rows.map(item => {
        userArray.push(item.smid)
      })

      if (userArray.length !== 0) {
        userArrayToString = userArray.join(",");
        conditionStatement = `where smid not in (${userArrayToString})`
      }

      let userExist = `SELECT smid,subject,'Pending' as status from studymaterial ${conditionStatement} `;
      const resultOfUser = await req.pool.query(userExist);
      let finalResult = [...resultOfUser.rows, ...userHistoryResult.rows];
      if (!finalResult.length) {
        return {
          ResultCode: 101,
          ReturnMessage: `Record Not Found`
        }
      }
      return {
        ResultCode: 100,
        ReturnMessage: `Successful`,
        ResponseData: finalResult
      }
    } catch (err) {
      return {
        ResultCode: 103,
        ReturnMessage: err.message
      };
    }
  }
};

const getPDFDetails = {
  auth: false,
  tags: ["api", "User"],
  description: "Get PDF Details",
  validate: {
    query: {
      subjectId: Joi.number().required(),
      userId: Joi.number().required(),
    }
  },
  async handler(req, h) {
    try {

      let userArray = [],
        userArrayToString = '',
        conditionStatement = '';
      let userHistory = `SELECT url,subject,timespan from studymaterial where smid=${req.query.subjectId}`;
      const userHistoryResult = await req.pool.query(userHistory);
      if (userHistoryResult.rowCount == 0) {
        return {
          ResultCode: 101,
          ReturnMessage: `Study Material Not Found`
        }
      }

      let userExist = `SELECT timeleft from userlog where userid=${req.query.userId} AND smid=${req.query.subjectId}`;
      const resultOfUser = await req.pool.query(userExist);
      if (resultOfUser.rowCount != 0 && resultOfUser.rows[0].timeleft == 0 && !resultOfUser.rows[0].timeleft) {
        userHistoryResult.rows[0].timespan = resultOfUser.rows[0].timeleft
      }
      return {
        ResultCode: 100,
        ReturnMessage: ` Record Found`,
        ResponseData: userHistoryResult.rows
      }
    } catch (err) {
      return {
        ResultCode: 103,
        ReturnMessage: err.message
      };
    }
  }
};

const registerUser = {
  auth: false,
  tags: ["api", "User"],
  description: "Register User",
  validate: {
    payload: {
      firstName: Joi.string().required().trim(),
      middleName: Joi.string().required().trim(),
      lastName: Joi.string().required().trim(),
      email: Joi.string().required().trim(),
      mobile: Joi.number().required(),
      password: Joi.string().required()
    }
  },
  async handler(req, h) {
    try {
      let userExist = `SELECT count(1) from userdetails where email='${req.payload.email}'`;
      const resultOfUser = await req.pool.query(userExist);
      if (resultOfUser.rows[0].count != 0) {
        return {
          ResultCode: 101,
          ReturnMessage: `User Already Exist! Try To LogIn`
        }
      }
      let insertsRecord = `INSERT INTO userdetails (firstname,middlename,lastname,email,mobile,password)
                VALUES ('${req.payload.firstName}','${req.payload.middleName}','${req.payload.lastName}','${req.payload.email}',${req.payload.mobile},'${req.payload.password}')`;
      await req.pool.query(insertsRecord);
      return {
        ResultCode: 100,
        ReturnMessage: `Resgistration Successful`
      }
    } catch (err) {
      return {
        ResultCode: 103,
        ReturnMessage: err.message
      };
    }
  }
};

const loginUser = {
  auth: false,
  tags: ["api", "User"],
  description: "Login User",
  validate: {
    payload: {
      email: Joi.string().required().trim(),
      password: Joi.string().required()
    }
  },
  async handler(req, h) {
    try {
      let userExist = `SELECT userid from userdetails where email='${req.payload.email}' AND password='${req.payload.password}'`;
      const resultOfUser = await req.pool.query(userExist);
      if (resultOfUser.rowCount != 0) {
        return {
          ResultCode: 100,
          ReturnMessage: `Login Successful`,
          ResponseData: resultOfUser.rows[0].userid
        }
      }
      return {
        ResultCode: 101,
        ReturnMessage: `Invalid User Credentials`
      }
    } catch (err) {
      return {
        ResultCode: 103,
        ReturnMessage: err.message
      };
    }
  }
};

const markStatusFinish = {
  auth: false,
  tags: ["api", "User"],
  description: "Mark study as finish",
  validate: {
    payload: {
      userId: Joi.number().required(),
      subjectId: Joi.number().required(),
    }
  },
  async handler(req, h) {
    try {
      let userExist = `SELECT count(1) from userlog WHERE userid=${req.payload.userId} AND smid=${req.payload.subjectId}`;
      const resultOfUser = await req.pool.query(userExist);
      if (resultOfUser.rows[0].count != 0) {
        let updateRecord = `update userlog set status='Finish', timeLeft=0 WHERE userid=${req.payload.userId} AND smid=${req.payload.subjectId}`;
        await req.pool.query(updateRecord);
      } else {
        let insertsRecord = `INSERT INTO userlog (userid,smid,status,timeLeft)
                  VALUES (${req.payload.userId},${req.payload.subjectId},'Finish',0)`;
        await req.pool.query(insertsRecord);
      }
      return {
        ResultCode: 100,
        ReturnMessage: `Successful`
      }
    } catch (err) {
      return {
        ResultCode: 103,
        ReturnMessage: err.message
      };
    }
  }
};

const createUserLog = {
  auth: false,
  tags: ["api", "User"],
  description: "create/update user log",
  validate: {
    payload: {
      userId: Joi.number().required(),
      log: Joi.array().required()
    }
  },
  async handler(req, h) {
    try {
      req.payload.log.map(async (item) => {
        let userExist = `SELECT status from userlog WHERE userid=${req.payload.userId} AND smid=${item.smid}`;
        const resultOfUser = await req.pool.query(userExist);
        if (resultOfUser.rowCount != 0) {
          let updateRecord = `update userlog set (status,timeleft)
                      = (${resultOfUser.rows[0].status ? `'${resultOfUser.rows[0].status}'`: 'InProcess'},${item.timeleft}) WHERE userid=${req.payload.userId} AND smid=${item.smid} `;
          await req.pool.query(updateRecord);
        } else {
          let insertsRecord = `INSERT INTO userlog (userid,smid,status,timeLeft)
                      VALUES (${req.payload.userId},${item.smid},'InProcess',${item.timeleft})`;
          await req.pool.query(insertsRecord);
        }
      })
      return {
        ResultCode: 100,
        ReturnMessage: `Successful`
      }
    } catch (err) {
      return {
        ResultCode: 103,
        ReturnMessage: err.message
      };
    }
  }
};

exports.routes = [{
    method: "POST",
    path: "/registerUser",
    config: registerUser
  },
  {
    method: "POST",
    path: "/loginUser",
    config: loginUser
  },
  {
    method: "get",
    path: "/getStudyMaterial",
    config: getStudyMaterial
  },
  {
    method: "get",
    path: "/getPDFDetails",
    config: getPDFDetails
  },
  {
    method: "POST",
    path: "/createUserLog",
    config: createUserLog
  },
  {
    method: "POST",
    path: "/markStatusFinish",
    config: markStatusFinish
  }
]
