import prisma from "./../prisma/prisma.js";
export const setReferDetatails = async (req, res) => {
  try {
    const { parentCommission, friendCommission, notReferCommission, mwa } =
      req.body;
    if (!parentCommission && !friendCommission && !notReferCommission && !mwa) {
      return res.status(400).json({
        status: false,
        message: "Request body not defined",
      });
    }
    await prisma.refer.update({
      where: {
        id: 1,
      },
      data: {
        parentCommission: Number(parentCommission),
        friendCommission: Number(friendCommission),
        notReferCommission: Number(notReferCommission),
        mwa: Number(mwa),
      },
    });

    return res.status(200).json({
      status: true,
      message: "Refer Details Successfully updated!...",
    });
  } catch (err) {
    return res.status(401).json({
      status: false,
      message: err.message,
    });
  }
};

export const getReferDetails = async (req, res) => {
  try {
    const refer = await prisma.refer.findFirst({
      where: {
        id: 1,
      },
    });
    return res.status(200).json({
      status: true,
      data: refer,
    });
  } catch (err) {
    return res.status(401).json({
      message: err.message,
      status: false,
    });
  }
};
export const getAllBetData = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const skip = (page - 1) * limit;
    const alldata = await prisma.aviator.findMany();
    const data = await prisma.aviator.findMany({
      skip: Number(skip),
      take: Number(limit),
      orderBy: {
        id: "desc",
      },
    });

    return res.status(200).json({
      status: true,
      message: "BetData Successfully fetched!...",
      data,
      length: alldata.length,
    });
  } catch (err) {
    return res.status(401).json({
      status: false,
      message: err.message,
    });
  }
};

export const acceptWithdraw = async (req, res) => {
  try {
    const { id, status, money, phone } = req.body;
    if (!id || !status || !phone || !money) {
      return res.status(400).json({
        status: false,
        message: "Client Side error",
      });
    }
    //console.log("hi");

    await prisma.withdraw.updateMany({
      where: {
        id: Number(id),
      },
      data: {
        status: Number(status),
      },
    });
    if (status === "2") {
      await prisma.users.updateMany({
        where: {
          phone,
        },
        data: {
          money: {
            increment: Number(money),
          },
        },
      });
    }

    return res.status(200).json({
      status: true,
      message: "Successfully updated!...",
    });
  } catch (err) {
    return res.status(401).json({
      status: false,
      message: err.message,
    });
  }
};
export const acceptRecharge = async (req, res) => {
  try {
    const { id, status, phone, amount } = req.body;
    if (!id || !status || !phone || !amount) {
      return res.status(400).json({
        status: false,
        message: "Client Side error",
      });
    }

    if (Number(status) === 2) {
      await prisma.aviatorrechargesecond.updateMany({
        where: {
          id: Number(id),
        },
        data: {
          status: String(status),
        },
      });
    } else {
      await prisma.users.updateMany({
        where: {
          phone: String(phone),
        },
        data: {
          money: {
            increment: Number(amount),
          },
        },
      });
      await prisma.aviatorrechargesecond.updateMany({
        where: {
          id: Number(id),
        },
        data: {
          status: String(status),
        },
      });
    }
    return res.status(200).json({
      status: true,
      message: "Successfully updated!...",
    });
  } catch (err) {
    return res.status(401).json({
      status: false,
      message: err.message,
    });
  }
};
export const getAllWithdrawalRequest = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const skip = (page - 1) * limit;
    const alldata = await prisma.withdraw.findMany({});
    const data = await prisma.withdraw.findMany({
      skip: Number(skip),
      take: Number(limit),
      orderBy: {
        id: "desc",
      },
    });

    return res.status(200).json({
      status: true,
      message: "WithdrawalData Successfully fetched!...",
      data,
      length: alldata.length,
    });
  } catch (err) {
    return res.status(401).json({
      status: false,
      message: err.message,
    });
  }
};
export const getAllUserData = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const skip = (page - 1) * limit;
    const alldata = await prisma.users.findMany({
      where: {
        token: {
          not: "0",
        },
      },
    });
    const data = await prisma.users.findMany({
      skip: Number(skip),
      take: Number(limit),
      orderBy: {
        id: "desc",
      },
      where: {
        token: {
          not: "0",
        },
      },
    });

    return res.status(200).json({
      status: true,
      message: "userData Successfully fetched!...",
      data,
      length: alldata.length,
    });
  } catch (err) {
    return res.status(401).json({
      status: false,
      message: err.message,
    });
  }
};
export const userSettings = async (req, res) => {
  try {
    const { id, status, money, phone } = req.body;
    if (!id || !phone) {
      return res.status(400).json({
        status: false,
        message: "Client Side error",
      });
    }
    if (money) {
      await prisma.users.updateMany({
        where: {
          phone,
        },
        data: {
          money: Number(money),
        },
      });
    }
    if (status) {
      await prisma.users.updateMany({
        where: {
          phone,
        },
        data: {
          status: Number(status),
        },
      });
    }
    return res.status(200).json({
      status: true,
      message: "Successfully updated!...",
    });
  } catch (err) {
    return res.status(401).json({
      status: false,
      message: err.message,
    });
  }
};

export const getAllRechargeDetails = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const skip = (page - 1) * limit;
    const alldata = await prisma.aviatorrecharge.findMany();
    const data = await prisma.aviatorrecharge.findMany({
      skip: Number(skip),
      take: Number(limit),
      orderBy: {
        id: "desc",
      },
    });
    return res.status(200).json({
      status: true,
      message: "RechargeData Successfully fetched!...",
      data,
      length: alldata.length,
    });
  } catch (err) {
    return res.status(401).json({
      status: false,
      message: err.message,
    });
  }
};

export const getDashBoardDetails = async (req, res) => {
  try {
    const totalRechargeAmount = await prisma.recharge.findMany({
      select: {
        money: true,
      },
    });

    const totalRechargeSum = totalRechargeAmount.reduce(
      (sum, entry) => sum + entry.money,
      0
    );

    //console.log("Total Recharge Amount:", totalRechargeSum);

    // Get total today's recharge amount
    const today = new Date().toISOString().split("T")[0]; // Get today's date in "YYYY-MM-DD" format
    const todayRechargeAmount = await prisma.recharge.findMany({
      where: {
        today: today,
      },
      select: {
        money: true,
      },
    });

    const todayRechargeSum = todayRechargeAmount.reduce(
      (sum, entry) => sum + entry.money,
      0
    );

    //console.log("Total Today Recharge Amount:", todayRechargeSum);

    const totalUsers = await prisma.users.findMany({
      orderBy: {
        time: "desc", // Sorting in descending order based on time
      },
    });
    const totalBetData = await prisma.aviator.findMany();
    const withdrawRequesets = await prisma.withdraw.findMany();
    const activeUsers = totalUsers.filter((item) => item.status === 1);
    const pendingUsers = totalUsers.filter((item) => item.status === 0);
    const rejectedUsers = totalUsers.filter((item) => item.status === 2);
    // //console.log(rechargeData, totalUsers, totalBetData, withdrawRequesets);
    // Get the current date in the same format as item.time
    const currentDate = new Date().toISOString();
    // Get the current date in milliseconds
    const currentDateMilliseconds = new Date().getTime();

    // Filter items where the time property is equal to the current date
    var MoreTodayUsers = totalUsers.filter(
      (item) => item.time && item.time === currentDateMilliseconds
    );

    // Filter items where the time property is equal to the current date
    var todayUsers = totalUsers.filter(
      (item) => item.time && item.time.startsWith(currentDate)
    );
    todayUsers = todayUsers.length + MoreTodayUsers.length;
    const withdrawData = await prisma.withdraw.findMany({
      where: {
        status: 1,
      },
    });

    const totalWithdrawAmount = withdrawData.reduce(
      (total, withdraw) => total + withdraw.money,
      0
    );

    //console.log("Total Withdraw Amount:", totalWithdrawAmount);

    const todayWithdrawData = await prisma.withdraw.findMany({
      where: {
        status: 1,
        today: today,
      },
    });

    const todayWithdrawAmount = todayWithdrawData.reduce(
      (total, withdraw) => total + withdraw.money,
      0
    );

    //console.log("Today's Withdraw Amount:", todayWithdrawAmount);
    const todayBetData = await prisma.aviator.findMany({
      where: {
        betTime: {
          gte: today + "T00:00:00.000Z",
          lte: today + "T23:59:59.999Z",
        },
      },
    });

    const data = {
      totalRechargeAmount: totalRechargeSum,
      todayRechargeAmount: todayRechargeSum,
      totalWithdrawAmount: totalWithdrawAmount,
      todayWithdrawAmount,
      totalUsers: totalUsers.length,
      totalBets: totalBetData.length,
      totalWithDrawRequest: withdrawRequesets.length,
      activeUsers: activeUsers.length,
      pendingUsers: pendingUsers.length,
      rejectedUsers: rejectedUsers.length,
      todayUsers,
      todayBets: todayBetData.length,
    };
    return res.status(200).json({
      status: true,
      message: "RechargeData Successfully fetched!...",
      data,
    });
  } catch (err) {
    return res.status(401).json({
      status: false,
      message: err.message,
    });
  }
};
export const getCurrentRoundBets = async (req, res) => {
  try {
    const autoaviatorData = await prisma.autoaviator.findMany({
      orderBy: {
        betTime: "desc",
      },
    });
    const totalBetAmount = autoaviatorData.reduce(
      (total, item) => total + item.betAmount,
      0
    );

    //console.log("Total Bet Amount:", totalBetAmount);
    const totalWithdrawAmount = autoaviatorData.reduce(
      (total, item) => total + (item.withdrawAmount || 0),
      0
    );

    //console.log("Total Withdraw Amount:", totalWithdrawAmount);
    // Create a set to store unique phone numbers
    const uniquePhones = new Set();

    // Iterate over the array and add unique phones to the set
    autoaviatorData.forEach((item) => {
      uniquePhones.add(item.phone);
    });

    // Get the total number of unique users
    const totalUniqueUsers = uniquePhones.size;

    //console.log("Total Unique Users:", totalUniqueUsers);
    const uniquePhonesWithWithdraw = new Set();

    // Iterate over the array and add unique phones with non-zero withdrawAmount to the set
    autoaviatorData.forEach((item) => {
      if (item.withdrawAmount !== 0) {
        uniquePhonesWithWithdraw.add(item.phone);
      }
    });
    const uniqueWithdraw = uniquePhonesWithWithdraw.size;
    // const totalWithDraw=data.
    return res.status(200).json({
      status: true,
      message: "Data Fetched Successfully...",
      data: {
        totalmoney: totalBetAmount,
        totalwithdraw: totalWithdrawAmount,
        totalUsers: totalUniqueUsers,
        totalWithdrawUsers: uniqueWithdraw,
      },
    });
  } catch (err) {
    return res.status(401).json({
      status: false,
      message: err.message,
    });
  }
};
export const getAllNormalRechargeDetails = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const skip = (page - 1) * limit;
    const alldata = await prisma.aviatorrechargesecond.findMany();
    const data = await prisma.aviatorrechargesecond.findMany({
      skip: Number(skip),
      take: Number(limit),
      orderBy: {
        id: "desc",
      },
    });
    return res.status(200).json({
      status: true,
      message: "RechargeData Successfully fetched!...",
      data,
      length: alldata.length,
    });
  } catch (err) {
    return res.status(401).json({
      status: false,
      message: err.message,
    });
  }
};
