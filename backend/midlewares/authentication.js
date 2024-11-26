import jwt from "jsonwebtoken";

const authentication = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (token) {
      let decodedData = jwt.verify(token, "1234");

      req.userId = decodedData?.id;
    }

    next();
  } catch (error) {
    console.log(error);
  }
};

export default authentication;
