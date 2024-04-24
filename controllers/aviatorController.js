import prisma from "./../prisma/prisma.js";
export const placeBet = async (req, res, next) => {
  try {
    const { phone, betAmount } = req.body;
        if (!phone || !betAmount || parseFloat(betAmount) <= 0) {
      return res.status(400).json({
        status: false,
        message: "Invalid phone number or bet amount",
      });
    }
    const user = await prisma.users.findFirst({
      where: {
        phone:String(phone),
      },
    });
    if (!user) {
      return res.json({
        status: false,
        message: "User Not Found!...",
      });
    }

    if (user.status === 2) {
      return res.status(400).json({
        status: false,
        message: "You Account Has Been blocked, you can't place bet!..",
        error: true,
      });
    }
    let check;
    let tp;
    if (user.money >= Number(betAmount)) {
      check = user.money - Number(betAmount);
      tp = 0;
    } else {
      check = user.bonusMoney - Number(betAmount);
      tp = 1;
    }
    if (check >= 0) {
      if (tp === 0) {
        await prisma.users.updateMany({
          where: {
            phone: String(phone),
          },
          data: {
            money: {
              decrement: Number(betAmount),
            },
          },
        });
      } else {
        await prisma.users.updateMany({
          where: {
            phone: String(phone),
          },
          data: {
            bonusMoney: {
              decrement: Number(betAmount),
            },
          },
        });
      }
    } else {
      return res.status(500).json({
        status: false,
        message: "Insufficient Balance",
      });
    }

    const newbet = await prisma.aviator.create({
      data: {
        phone: String(phone),
        betAmount: Number(betAmount),
      },
    });
    await prisma.autoaviator.create({
      data: {
        betAmount: Number(betAmount),
        phone: String(phone),
      },
    });
    return res.status(200).json({
      status: true,
      message: "Bet Successfully Placed!..",
      betId: newbet.id,
    });
  } catch (err) {
    return res.status(401).json({
      status: false,
      message: err.message,
    });
  }
};

export const withdrawBet = async (req, res, next) => {
  try {
    if (!req.body) {
      return res.status(400).json({
        status: false,
        message: "Request body not defined",
      });
    }
    const { phone, multiplier, betId } = req.body;
    const user = await prisma.users.findFirst({
      where: {
        phone: String(phone),
      },
    });
    if (!user) {
      return res.status(400).json({
        status: false,
        message: "User Not Found!...",
      });
    }

    const aviator = await prisma.aviator.findFirst({
      where: {
        id: Number(betId),
      },
    });
    const autoaviator = await prisma.autoaviator.findFirst({
      where: {
        id: Number(betId),
      },
    });
    const withdrawAmount = Math.floor(Number(multiplier) * aviator.betAmount);
    await prisma.aviator.updateMany({
      where: {
        id: betId,
      },
      data: {
        withdrawAmount,
        multiplier: Number(multiplier),
        withdrawTime: new Date().toISOString(),
      },
    });
    await prisma.autoaviator.updateMany({
      where: {
        id: betId,
      },
      data: {
        withdrawAmount,
        multiplier: Number(multiplier),
        withdrawTime: new Date().toISOString(),
      },
    });
    await prisma.users.updateMany({
      where: {
        phone:String(phone),
      },
      data: {
        bonusMoney: {
          increment: Number(withdrawAmount),
        },
      },
    });

    return res.status(200).json({
      status: true,
      message: "Money succesfully added to Your account",
    });
  } catch (err) {
    return res.status(401).json({
      status: false,
      message: err.message,
    });
  }
};

export const crashedPlaneSettings = async (req, res, next) => {
  try {
    if (!req.body) {
      return res.status(400).json({
        status: false,
        message: "Request body not defined",
      });
    }
    const existingCrashedPlane = await prisma.crashedplane.findUnique({
      where: {
        id: 1,
      },
    });
    if (!existingCrashedPlane) {
      await prisma.crashedplane.create();
    }
    const { nl, nh, sl, sh, sp, sm, ml, mh, mr, da } = req.body;
    if (nl && nh) {
      await prisma.crashedplane.update({
        where: {
          id: 1,
        },
        data: {
          nl: String(nl),
          nh: String(nh),
        },
      });

      return res.status(200).json({
        status: true,
        message: "Settings Updated",
      });
    }
    if (sl && sh && sp && sm) {
      await prisma.crashedplane.update({
        where: {
          id: 1,
        },
        data: {
          sl: String(sl),
          sh: String(sh),
          sm: String(sm),
          sp: String(sp),
        },
      });
      return res.status(200).json({
        status: true,
        message: "Settings Updated",
      });
    }
    //console.log(ml, mh, mr, da);
    if (ml && mh && da) {
      const updateData = {
        ml: String(ml),
        mh: String(mh),
        da: String(da),
      };

      if (mr) {
        updateData.mr = String(mr);
      }

      await prisma.crashedplane.update({
        where: {
          id: 1,
        },
        data: updateData,
      });
      return res.status(200).json({
        status: true,
        message: "Settings Updated",
      });
    }

    return res.status(200).json({
      status: false,
      message: "Please fill Require Fields",
    });
  } catch (err) {
    return res.status(401).json({
      status: false,
      message: err.message,
    });
  }
};

export const getCrashedPlaneSettings = async (req, res, next) => {
  try {
    const settings = await prisma.crashedplane.findFirst({
      where: {
        id: 1,
      },
    });
    return res.status(200).json({
      status: true,
      message: "data Found!....",
      data: settings,
    });
  } catch (err) {
    return res.status(401).json({
      status: false,
      message: err.message,
    });
  }
};

export const totalSumAmount = async (req, res, next) => {
  try {
    const settings = await prisma.betTime.findFirst({
      where: {
        id: 1,
      },
    });

    const oneMinuteAgo = new Date();
    oneMinuteAgo.setMinutes(oneMinuteAgo.getMinutes() - 1);

    const betData = await prisma.aviator.findMany({
      where: {
        betTime: {
          gte: oneMinuteAgo.toISOString(), // Greater than or equal to one minute ago
        },
      },
    });

    const betTimesInMilliseconds = betData.map((item) => ({
      ...item,
      betTime: Number(new Date(item.betTime).getTime()), // Convert betTime to milliseconds
    }));
    const lowertime = Number(settings.time);
    const uppertime = lowertime + 15000;
    const filteredBetData = betTimesInMilliseconds.filter((item) => {
      const betTimeInMilliseconds = item.betTime;
      return (
        betTimeInMilliseconds > lowertime && betTimeInMilliseconds < uppertime
      );
    });
    const sumOfAmount = filteredBetData.reduce(
      (sum, item) => sum + item.betAmount,
      0
    );
    return res.status(200).json({
      status: true,
      message: "data Found!....",
      data: betTimesInMilliseconds,
    });
  } catch (err) {
    return res.status(401).json({
      status: false,
      message: err.message,
    });
  }
};

export const deleteAllBets = async (req, res, next) => {
  //console.log("deleteallbets");
  try {
    await prisma.autoaviator.deleteMany();
    return res.status(200).json({
      status: true,
      message: "all bets deleted Successfully",
    });
  } catch (err) {
    //console.log(err.message);
  }
};
