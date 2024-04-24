import prisma from "./../prisma/prisma.js";
import md5 from "md5";

import {
  randomNumber,
  randomString,
  timeCreate,
  isNumber,
  ipAddress,
} from "./../utils/randomGenerate.js";

export const login = async (req, res, next) => {
  const { username, password } = req.body;
  //console.log(phone, pwd);
  if (!username || !password) {
    return res.status(400).json({
      message: "Bad Request: Missing required parameters",
      status: false,
    });
  }

  try {
    
    const admin = await prisma.aviatoradmin.findFirst({
      where: {
        username: String(username),
        password: String(password),
      },
    });

    if (!admin) {
      return res.status(401).json({
        message: "Incorrect username or Password",
        status: false,
      });
    }

    return res.status(200).json({
      message: "Login Successfull",
      status: true,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error",
      status: false,
    });
  }
};

export const changepassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const admins = await prisma.aviatoradmin.findFirst({
      where: {
        password: String(oldPassword),
      },
    });
   

    if (admins.password !== oldPassword || !admins) {
      return res.status(401).json({
        message: "old Password is not correct!...",
        status: false,
      });
    }
    await prisma.aviatoradmin.updateMany({
      where: {
        password: String(oldPassword),
      },
      data: {
        password: String(newPassword),
      },
    });
    return res.status(200).json({
      message: "Change password successfully",
      status: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal Server Error",
      status: false,
    });
  }
};
