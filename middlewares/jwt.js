import jwt from "jsonwebtoken";

export const UserProtect = async (req, res, next) => {
  try {
    const auth_header = req.headers["authorization"];
    if (!auth_header) return res.sendStatus(401);
    let token = auth_header.split(" ")[1];
    if (!token) return res.sendStatus(401);
    jwt.verify(
      token,
      process.env.JWT_ACCESS_TOKEN_SECRET,
      async (err, payload) => {
        if (err) return res.sendStatus(403);
        req.user = await User.findById(payload._id);
        next();
      }
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong!" });
  }
};
