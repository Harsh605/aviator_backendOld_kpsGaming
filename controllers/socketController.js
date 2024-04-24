// Import necessary modules
import { Server } from "socket.io";
import prisma from "../prisma/prisma.js";
import {
  generateRandomNumber,
  updateSingleValues,
} from "../utils/randomGenerate.js";

import { millisecondsToDateString } from "../utils/millisecondsToDateString.js";
export const initSocketController = async (server) => {
  const io = new Server(server, {
    cors: {
      // origin: [process.env.client, process.env.adminClient],
      origin: "*",
      methods: ["GET", "POST"],
    },
  });
  // Store user socket associations
  var userSocketMap = new Map();
  var connectedUsers = new Set();
  var crashedValue;
  var count = 0;
  var countdownIntervalId;
  var startIntervalId;
  var intervalId = null;
  crashedPlaneNumber(count);
  var clientId;
  var connectedArray = [];
  var adminCrashedTime = 0;
  var newCount = 0;
  var lastCrashedValues = [];
  function updateArray(arr, newValue) {
    arr.push(newValue);
    if (arr.length > 60) {
      arr.shift();
    }
    lastCrashedValues = arr;
  }
  io.on("resetCount", () => {
    //console.log("outsideResetCountFuncton....");
    count = 0;
    newCount = 0;
  });

  // =========== crashedPlaneNumber ==========
  async function crashedPlaneNumber(count) {
    //console.log("COUNT VALUE", count);

    if (count === 0) {
      crashedValue = await generatePlaneCrashed(0);
      io.to("aviatorRoom").emit("crashedValue", crashedValue);
    }
    if (count === 1) {
      crashedValue = await generatePlaneCrashed(1);
      io.to("aviatorRoom").emit("crashedValue", crashedValue);
    }
    if (crashedValue && count < 2) {
      startInterval(1.0);
    } else if (count >= 2) {
      await startCountdownInterval(1.0);
    }
  }
  // ======= StartPlaneCode ========
  function startInterval(initialValue) {
    //console.log("=== startInterval ===");
    startIntervalId = setInterval(async () => {
      if (initialValue <= crashedValue) {
        initialValue = (parseFloat(initialValue) + 0.01).toFixed(2);
        if (!adminCrashedTime) {
          io.to("aviatorRoom").emit("gameStarted", true);
          io.to("aviatorRoom").emit("planeCounter", initialValue);
        } else {
          updateArray(lastCrashedValues, initialValue);
          io.to("aviatorRoom").emit("lastCrashed", lastCrashedValues);
          io.to("aviatorRoom").emit("planeCounter", 0);
          io.to("aviatorRoom").emit("gameStarted", false);
          crashedValue = 0;
          adminCrashedTime = 0;
          clearInterval(intervalId);
          setTimeout(() => crashedPlaneNumber(count), 12000);
          clearInterval(startIntervalId);
        }
      } else {
        updateArray(lastCrashedValues, initialValue);
        io.to("aviatorRoom").emit("lastCrashed", lastCrashedValues);
        io.to("aviatorRoom").emit("planeCounter", 0);
        io.to("aviatorRoom").emit("gameStarted", false);
        crashedValue = 0;
        clearInterval(intervalId);
        setTimeout(() => crashedPlaneNumber(count), 12000);
        clearInterval(startIntervalId);
      }
    }, 100); // Run the interval every 100 milliseconds
  }

  async function startCountdownInterval(initialValue) {
    //console.log("=== startCountdownInterval ===");

    // var crashedValue = 1;
    var startTime = new Date().getTime();
    var getTotalAmount = await getTotalBetAmount();
    var crashedPlaneSettings = await prisma.crashedplane.findFirst({
      where: {
        id: 1,
      },
    });
    var newCrashedValue = 10.0;
    countdownIntervalId = setInterval(async () => {
      initialValue = (parseFloat(initialValue) + 0.01).toFixed(2);
      if (!adminCrashedTime && initialValue <= 10.0) {
        io.to("aviatorRoom").emit("planeCounter", initialValue);
        io.to("aviatorRoom").emit("gameStarted", true);
      } else {
        updateArray(lastCrashedValues, initialValue);

        io.to("aviatorRoom").emit("lastCrashed", lastCrashedValues);
        io.to("aviatorRoom").emit("planeCounter", 0);
        io.to("aviatorRoom").emit("gameStarted", false);
        adminCrashedTime = 0;
        setTimeout(() => crashedPlaneNumber(count), 12000);
        clearInterval(countdownIntervalId);
        return;
      }
      var { ml, mh, mr, da } = crashedPlaneSettings;
      ml = Number(ml);
      mh = Number(mh);
      mr = Number(mr);
      da = Number(da);
      const distributedAmount = Math.round(
        (getTotalAmount * (100 - (da + 20))) / 100
      );
      const totalWithdrawAmount = await getWithdrawAmount(startTime);
      if (distributedAmount < totalWithdrawAmount) {
        newCrashedValue = 0;
      }

      if (!newCrashedValue) {
        updateArray(lastCrashedValues, initialValue);
        io.to("aviatorRoom").emit("lastCrashed", lastCrashedValues);
        io.to("aviatorRoom").emit("planeCounter", 0);
        io.to("aviatorRoom").emit("gameStarted", false);
        setTimeout(() => crashedPlaneNumber(count), 12000);
        clearInterval(countdownIntervalId);
      }
    }, 100);
  }
  io.on("connection", async (socket) => {
    socket.on("resetCount", () => {
      count = 0;
      newCount = 0;
    });
    socket.on("crashedTime", (time) => {
      adminCrashedTime = time;
    });
    clientId = socket.handshake.query.clientId || "0000000000";
    if (clientId != "0000000000" && clientId) {
      connectedUsers.add(clientId);
    }
    socket.join(clientId);
    socket.join("aviatorRoom");
    //console.log("connected", connectedUsers);
    connectedArray = Array.from(connectedUsers);
    socket.on("betPlaced", (betCount) => {
      count = count + betCount;
    });
    socket.on("withdrawCount", (withdrawCount) => {
      count = count > 0 ? count - withdrawCount : 0;
    });

    //console.log("===== connection code =====");
    socket.on("listenCrashedPlane", async () => {
      const crashedNumber = await generatePlaneCrashed(1);
      io.emit("adminPlaneCrashedNumber", crashedNumber);
    });

    //game logic
    socket.on("crashedPlane", () => {
      let gameStartedTime = 12000 + Date.now();
      setTimeout(() => {
        //console.log(gameStartedTime, Date.now()); // Now you'll see a difference
      }, 0);
      io.to("aviatorRoom").emit("gameStartedTime", gameStartedTime);
    });

    if (clientId === connectedArray[0]) {
      socket.on("newBetTime", async (time) => {
        //console.log(time);
        await prisma.betTime.update({
          where: {
            id: 1,
          },
          data: {
            time: String(time),
          },
        });
      });
    }
    socket.on("disconnect", () => {
      //console.log("===== User disconnected ======");
      // Remove the mapping on user disconnect
      // Find and remove the user ID from the map
      for (const [key, value] of userSocketMap) {
        if (value === socket.id) {
          userSocketMap.delete(key);
          break;
        }
      }
      // Remove the user from the set based on the socket ID
      connectedUsers.delete(socket.handshake.query.clientId);
    });
  });
};

/// plane number generate logics...
var currentValuesArray = [];
export async function generatePlaneCrashed(length) {
  const planeSettings = await prisma.crashedplane.findFirst({
    where: {
      id: 1,
    },
  });

  const { nl, nh, sl, sh, sp, sm } = planeSettings;
  if (length == 0) {
    return generateRandomNumber(Number(nl), Number(nh));
  } else if (length === 1) {
    return updateSingleValues(Number(sp), Number(sm), Number(sh), sl);
  }
}

// getTotalBetAmount for 15seconds....
const getTotalBetAmount = async () => {
  try {
    const betData = await prisma.autoaviator.findMany();

    const sumOfAmount = betData.reduce((sum, item) => sum + item.betAmount, 0);
    return sumOfAmount;
  } catch (err) {
    return err.message;
  }
};

//get withdrawAmmount ....
const getWithdrawAmount = async (time) => {
  try {
    const withdrawTime = millisecondsToDateString(time);
    const betData = await prisma.aviator.findMany({
      where: {
        withdrawAmount: {
          not: 0,
        },
        withdrawTime: {
          gte: withdrawTime, // Greater than or equal to one minute ago
        },
      },
    });
    const sumOfAmount = betData.reduce(
      (sum, item) => sum + item.withdrawAmount,
      0
    );
    return sumOfAmount;
  } catch (err) {
    return err.message;
  }
};
