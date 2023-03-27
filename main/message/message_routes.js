import { Router } from "express";
const router = Router();

import {
  getChatListOfUser,
  getChatMessagesWithUsersFriend,
  postMessageToFriend,
} from "./message_controller.js";

router.route("/").get(getChatListOfUser);

router
  .route("/:friend_id")
  .get(getChatMessagesWithUsersFriend)
  .post(postMessageToFriend);

export default router;
