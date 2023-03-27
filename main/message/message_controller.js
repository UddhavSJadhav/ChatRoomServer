import { Message } from "./message_model.js";

export const getChatListOfUser = async (req, res) => {
  try {
    const userId = req.user._id;
    const chatList = await Message.aggregate([
      {
        $match: {
          $or: [
            {
              from: userId,
            },
            { to: userId },
          ],
        },
      },
      { $sort: { createdAt: 1 } },
      {
        $addFields: {
          friend: {
            $cond: [{ $eq: [userId, "$to"] }, "$from", "$to"],
          },
        },
      },
      {
        $group: {
          _id: { friend: "$friend" },
          text: { $first: "$text" },
          from: { $first: "$from" },
          to: { $first: "$to" },
          seen: { $first: "$seen" },
          createdAt: { $first: "$createdAt" },
        },
      },
      {
        $project: {
          friend: "$_id.friend",
          text: 1,
          from: 1,
          to: 1,
          seen: 1,
          createdAt: 1,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "friend",
          foreignField: "_id",
          as: "friend",
        },
      },
      { $unwind: "$friend" },
      {
        $project: {
          friend: "$friend._id",
          text: 1,
          from: 1,
          to: 1,
          seen: 1,
          createdAt: 1,
          name: "$friend.name",
        },
      },
    ]);
    res.status(200).json({ data: chatList });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong!" });
  }
};

export const getChatMessagesWithUsersFriend = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const friendId = req.params.friend_id;
    const chatMessages = await Message.find({
      $or: [
        { from: userId, to: friendId },
        { from: friendId, to: userId },
      ],
    }).sort("-createdAt");
    res.status(200).json({ data: chatMessages });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong!" });
  }
};

export const postMessageToFriend = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message)
      return res.status(400).json({ message: "Message is required!" });

    await Message.create({
      to: req.params.friend_id,
      from: req.user._id,
      text: message,
    });

    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong!" });
  }
};
