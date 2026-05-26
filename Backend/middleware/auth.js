// Route guard middleware: allows only authenticated session users.
export const protect = (req, res, next) => {
  if (req.isAuthenticated?.()) {
    return next();
  }

  return res.status(401).json({ error: "Authentication required" });
};
