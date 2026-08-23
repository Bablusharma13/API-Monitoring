export const successsResponse = (
  res,
  data = null,
  status = 200,
  message = "success",
) => {
  return res.status(status).json({ message, data });
};

export const errorResponse = (
  res,
  error,
  status = 500,
  message = "Something went wrong please try agiain later",
) => {
  console.log("error", error);
  const errorMessage = error?.message || message;
  return res.status(status).json({ message: errorMessage });
};
