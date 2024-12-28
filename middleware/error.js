class ErrorHandler extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

export const errorMiddleWare = (err, req, res, next) => {
  err.message = err.message || "Internal server error";
  err.statusCode = err.statusCode || 500;

  if (err.name === "JsonWebTokenError") {
    const message = "JSON Web Token is not valid, please try again";
    err = new ErrorHandler(message, 400);
  }
  if (err.name === "TokenExpiredError") {
    const message = "JSON Web Token is Expired, please try again";
    err = new ErrorHandler(message, 400);
  }
  if (err.name === "CastError") {
    const message = `invalid ${err.path}`;
    err = new ErrorHandler(message, 400);
  }

  const errorMessage = err.errors
    ? Object.values(err.errors)
        .map((err) => err.message)
        .join(" ")
    : err.message;

  return res.status(err.statusCode).json({
    success: false,
    message: errorMessage,
  });
};


export default ErrorHandler;